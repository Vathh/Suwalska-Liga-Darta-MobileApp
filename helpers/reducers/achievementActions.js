export const SET_MAX = 'SET_MAX';
export const SET_ONESEVENTY = 'SET_ONESEVENTY';
export const SET_HF = 'SET_HF';
export const SET_QF = 'SET_QF';

export const setMax = (value) => ({
  type: SET_MAX,
  payload: value
});

export const setOneSeventy = (value) => ({
  type: SET_ONESEVENTY,
  payload: value
});

export const setHf = (value) => ({
  type: SET_HF,
  payload: value
});

export const setQf = (value) => ({
  type: SET_QF,
  payload: value
});

export const initialAchievementsState = {
  max: [],
  oneSeventy: [],
  hf: [],
  qf: []
}