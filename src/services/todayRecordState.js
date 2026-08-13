import AsyncStorage from "@react-native-async-storage/async-storage";

const RESULT_READY_KEY = "todays-casting:today-result-ready";
const RESULT_NOTICE_HIDDEN_KEY = "todays-casting:result-notice-hidden";
const RESULT_LIKED_KEY = "todays-casting:today-result-liked";

const listeners = new Set();

const state = {
  resultDate: null,
  resultNoticeHiddenDate: null,
  resultLikedDate: null,
};

export const getTodayDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isToday = (dateKey) => dateKey === getTodayDateKey();

const getPublicState = () => ({
  resultDate: isToday(state.resultDate) ? state.resultDate : null,
  resultReady: isToday(state.resultDate),
  resultNoticeHidden: isToday(state.resultNoticeHiddenDate),
  resultLiked: isToday(state.resultLikedDate),
});

AsyncStorage.multiGet([RESULT_READY_KEY, RESULT_NOTICE_HIDDEN_KEY, RESULT_LIKED_KEY])
  .then((entries) => {
    const values = Object.fromEntries(entries);

    state.resultDate = values[RESULT_READY_KEY] || null;
    state.resultNoticeHiddenDate = values[RESULT_NOTICE_HIDDEN_KEY] || null;
    state.resultLikedDate = values[RESULT_LIKED_KEY] || null;
    notify();
  })
  .catch(() => {});

function notify() {
  const nextState = getPublicState();

  listeners.forEach((listener) => listener(nextState));
}

export function getTodayRecordState() {
  return getPublicState();
}

export function setTodayResultReady(value) {
  state.resultDate = value ? getTodayDateKey() : null;
  const update = value
    ? AsyncStorage.setItem(RESULT_READY_KEY, state.resultDate)
    : AsyncStorage.removeItem(RESULT_READY_KEY);

  update.catch(() => {});
  notify();
}

export function setResultNoticeHidden(value) {
  state.resultNoticeHiddenDate = value ? getTodayDateKey() : null;
  const update = value
    ? AsyncStorage.setItem(RESULT_NOTICE_HIDDEN_KEY, state.resultNoticeHiddenDate)
    : AsyncStorage.removeItem(RESULT_NOTICE_HIDDEN_KEY);

  update.catch(() => {});
  notify();
}

export function setTodayResultLiked(value) {
  state.resultLikedDate = value ? getTodayDateKey() : null;
  const update = value
    ? AsyncStorage.setItem(RESULT_LIKED_KEY, state.resultLikedDate)
    : AsyncStorage.removeItem(RESULT_LIKED_KEY);

  update.catch(() => {});
  notify();
}

export function subscribeTodayRecordState(listener) {
  listeners.add(listener);
  listener(getPublicState());

  return () => {
    listeners.delete(listener);
  };
}
