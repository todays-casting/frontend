import AsyncStorage from "@react-native-async-storage/async-storage";

const RESULT_READY_KEY = "todays-casting:today-result-ready";
const RESULT_NOTICE_HIDDEN_KEY = "todays-casting:result-notice-hidden";

const listeners = new Set();

const state = {
  resultReady: false,
  resultNoticeHidden: false,
};

AsyncStorage.multiGet([RESULT_READY_KEY, RESULT_NOTICE_HIDDEN_KEY])
  .then((entries) => {
    const values = Object.fromEntries(entries);

    state.resultReady = values[RESULT_READY_KEY] === "true";
    state.resultNoticeHidden = values[RESULT_NOTICE_HIDDEN_KEY] === "true";
    notify();
  })
  .catch(() => {});

function notify() {
  listeners.forEach((listener) => listener({ ...state }));
}

export function getTodayRecordState() {
  return { ...state };
}

export function setTodayResultReady(value) {
  state.resultReady = value;
  AsyncStorage.setItem(RESULT_READY_KEY, value ? "true" : "false").catch(() => {});
  notify();
}

export function setResultNoticeHidden(value) {
  state.resultNoticeHidden = value;
  AsyncStorage.setItem(RESULT_NOTICE_HIDDEN_KEY, value ? "true" : "false").catch(() => {});
  notify();
}

export function subscribeTodayRecordState(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
