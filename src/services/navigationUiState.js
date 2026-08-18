const listeners = new Set();
const analysisLoadingSources = new Set();

const state = {
  analysisLoadingVisible: false,
};

const notify = () => {
  listeners.forEach((listener) => listener({ ...state }));
};

export const getNavigationUiState = () => ({ ...state });

export const setAnalysisLoadingVisible = (value, source = "global") => {
  if (value) {
    analysisLoadingSources.add(source);
  } else {
    analysisLoadingSources.delete(source);
  }

  state.analysisLoadingVisible = analysisLoadingSources.size > 0;
  notify();
};

export const clearAnalysisLoadingVisible = () => {
  analysisLoadingSources.clear();
  state.analysisLoadingVisible = false;
  notify();
};

export const subscribeNavigationUiState = (listener) => {
  listeners.add(listener);
  listener({ ...state });

  return () => {
    listeners.delete(listener);
  };
};
