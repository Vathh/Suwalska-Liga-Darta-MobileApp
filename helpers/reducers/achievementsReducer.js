import { SET_HF, SET_MAX, SET_ONESEVENTY, SET_QF } from "./achievementActions";

export const achievementsReducer = (state, action) => {
  switch (action.type) {
    case SET_MAX:
      return { 
        ...state, 
        max: [...state.max, action.payload]
      };
    case SET_ONESEVENTY:
      return { 
        ...state, 
        oneSeventy: [...state.oneSeventy, action.payload]
      };
    case SET_HF:
      return { 
        ...state, 
        hf: [...state.hf, action.payload]
      };
    case SET_QF:
      return { 
        ...state, 
        qf: [...state.qf, action.payload]
      };
    default:
      return state;
  }
}