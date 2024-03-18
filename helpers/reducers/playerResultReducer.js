import { LEG_LOSE, LEG_WIN, UNDO, UPDATE_STATS } from "./playerResultActions";

export const playerResultReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_STATS: {
      const score = state.score - action.points;
      const totalDartsThrown = state.totalDartsThrown + 3;
      const totalPointsEarned = state.totalPointsEarned + action.points;
      const matchAverage = ((totalPointsEarned/totalDartsThrown) * 3).toFixed(2);

      const dartsThrown = state.dartsThrown + 3;
      const currentLegScores = [...state.currentLegScores, action.points];
      const currentLegAverage = (((501 - score)/dartsThrown) * 3).toFixed(2);

      return {
        ...state,
        score,
        totalDartsThrown,
        totalPointsEarned,
        matchAverage,
        dartsThrown,
        currentLegScores,
        currentLegAverage
      };
    };
    case LEG_WIN: {

      const totalDartsThrown = state.totalDartsThrown + action.throws;
      const totalPointsEarned = state.totalPointsEarned + state.score;
      const matchAverage = ((totalPointsEarned/totalDartsThrown) * 3).toFixed(2);

      const dartsThrown = state.dartsThrown + action.throws;
      const currentLegScores = [...state.currentLegScores, state.score];
      const currentLegAverage = ((501/dartsThrown)*3).toFixed(2);

      return {
        score: 501,
        legsWon: state.legsWon + 1,
        totalDartsThrown,
        totalPointsEarned,
        matchAverage,
        dartsThrown: 0,
        currentLegScores: [],
        currentLegAverage: 0,
        dartsPerLeg: [...state.dartsPerLeg, dartsThrown],
        legsAverages: [...state.legsAverages, currentLegAverage],
        legByLegScores: [...state.legByLegScores,currentLegScores]
      };
    };
    case LEG_LOSE: {
      const currentLegScores = state.currentLegScores;
      const currentLegAverage = state.currentLegAverage;

      return {
        ...state,
        score: 501,
        dartsThrown: 0,
        currentLegScores: [],
        currentLegAverage: 0,
        legsAverages: [...state.legsAverages, currentLegAverage],
        legByLegScores: [...state.legByLegScores,currentLegScores]
      };
    };
    case UNDO: {
      const scores = state.currentLegScores;
      const lastScore = scores.pop();
      const score = state.score + lastScore;
      const totalPointsEarned = state.totalPointsEarned - lastScore;
      const dartsThrown = state.dartsThrown - 3;
      const totalDartsThrown = state.totalDartsThrown - 3;
      const matchAverage = (totalPointsEarned/totalDartsThrown*3).toFixed(2);
      const currentLegAverage = ((501 - score)/dartsThrown*3).toFixed(2);

      return {
        ...state,
        score,
        totalPointsEarned,
        totalDartsThrown,
        matchAverage,
        dartsThrown,
        currentLegScores: scores,
        currentLegAverage
      }
    }
    default:
      return state;
  }
}