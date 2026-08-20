import AsyncStorage from "@react-native-async-storage/async-storage";

const RESULT_READY_KEY = "todays-casting:today-result-ready";
const RESULT_NOTICE_HIDDEN_KEY = "todays-casting:result-notice-hidden";
const RESULT_LIKED_KEY = "todays-casting:today-result-liked";
const RESULT_DATA_KEY = "todays-casting:today-result-data";
const DEFAULT_SCOPE = "anonymous";

const listeners = new Set();
let storageScope = DEFAULT_SCOPE;

const state = {
  resultDate: null,
  resultNoticeHiddenDate: null,
  resultLikedDate: null,
  resultData: null,
};

export const getTodayDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isToday = (dateKey) => dateKey === getTodayDateKey();

const hasResultContent = (resultData) => {
  if (!resultData || typeof resultData !== "object") {
    return false;
  }

  return [
    resultData.title,
    resultData.genre,
    resultData.line,
    resultData.scene,
    resultData.imageUrl,
  ].some((value) => typeof value === "string" && value.trim().length > 0);
};

const getScopedKey = (key) => `${key}:${storageScope}`;

const getScopedKeys = () => [
  getScopedKey(RESULT_READY_KEY),
  getScopedKey(RESULT_NOTICE_HIDDEN_KEY),
  getScopedKey(RESULT_LIKED_KEY),
  getScopedKey(RESULT_DATA_KEY),
];

const getPublicState = () => ({
  resultDate: isToday(state.resultDate) ? state.resultDate : null,
  resultReady: isToday(state.resultDate) && hasResultContent(state.resultData),
  resultNoticeHidden: state.resultNoticeHiddenDate === "hidden",
  resultLiked: isToday(state.resultLikedDate),
  resultData: isToday(state.resultDate) ? state.resultData : null,
});

AsyncStorage.multiGet(getScopedKeys())
  .then((entries) => {
    applyStoredEntries(entries);
    notify();
  })
  .catch(() => {});

function resetMemoryState() {
  state.resultDate = null;
  state.resultNoticeHiddenDate = null;
  state.resultLikedDate = null;
  state.resultData = null;
}

function applyStoredEntries(entries) {
  const values = Object.fromEntries(entries);
  const storedNoticeHidden = values[getScopedKey(RESULT_NOTICE_HIDDEN_KEY)];

  state.resultDate = values[getScopedKey(RESULT_READY_KEY)] || null;
  state.resultNoticeHiddenDate = storedNoticeHidden
    ? "hidden"
    : null;
  state.resultLikedDate = values[getScopedKey(RESULT_LIKED_KEY)] || null;
  state.resultData = parseStoredResult(values[getScopedKey(RESULT_DATA_KEY)]);
}

function parseStoredResult(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function notify() {
  const nextState = getPublicState();

  listeners.forEach((listener) => listener(nextState));
}

export function getTodayRecordState() {
  return getPublicState();
}

export function setTodayResultReady(value, resultData = null) {
  state.resultDate = value ? getTodayDateKey() : null;
  state.resultData = value ? resultData : null;
  const update = value
    ? AsyncStorage.multiSet([
        [getScopedKey(RESULT_READY_KEY), state.resultDate],
        [getScopedKey(RESULT_DATA_KEY), JSON.stringify(resultData ?? null)],
      ])
    : AsyncStorage.multiRemove([
        getScopedKey(RESULT_READY_KEY),
        getScopedKey(RESULT_DATA_KEY),
      ]);

  update.catch(() => {});
  notify();
}

export function setResultNoticeHidden(value) {
  state.resultNoticeHiddenDate = value ? "hidden" : null;
  const update = value
    ? AsyncStorage.setItem(
        getScopedKey(RESULT_NOTICE_HIDDEN_KEY),
        state.resultNoticeHiddenDate
      )
    : AsyncStorage.removeItem(getScopedKey(RESULT_NOTICE_HIDDEN_KEY));

  update.catch(() => {});
  notify();
}

export function setTodayResultLiked(value) {
  state.resultLikedDate = value ? getTodayDateKey() : null;
  const update = value
    ? AsyncStorage.setItem(getScopedKey(RESULT_LIKED_KEY), state.resultLikedDate)
    : AsyncStorage.removeItem(getScopedKey(RESULT_LIKED_KEY));

  update.catch(() => {});
  notify();
}

export function resetTodayRecordState() {
  resetMemoryState();

  AsyncStorage.multiRemove(getScopedKeys()).catch(() => {});
  notify();
}

export function clearTodayRecordSession() {
  storageScope = DEFAULT_SCOPE;
  resetMemoryState();
  notify();
}

export function setTodayRecordStateScope(scope) {
  storageScope = String(scope || DEFAULT_SCOPE);
  resetMemoryState();
  notify();

  AsyncStorage.multiGet(getScopedKeys())
    .then((entries) => {
      applyStoredEntries(entries);
      notify();
    })
    .catch(() => {});
}

export function subscribeTodayRecordState(listener) {
  listeners.add(listener);
  listener(getPublicState());

  return () => {
    listeners.delete(listener);
  };
}
