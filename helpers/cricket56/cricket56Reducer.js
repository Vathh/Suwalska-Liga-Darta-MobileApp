export const CRICKET56_APPLY = 'CRICKET56_APPLY';
export const CRICKET56_RESTORE = 'CRICKET56_RESTORE';
export const CRICKET56_LEG_WIN = 'CRICKET56_LEG_WIN';
export const CRICKET56_LEG_RESET = 'CRICKET56_LEG_RESET';

export const initialCricket56State = () => ({
	score: 0,
	legsWon: 0,
});

export const cricket56Reducer = (state, action) => {
	switch (action.type) {
		case CRICKET56_APPLY:
			return {
				...state,
				score: action.score,
				legsWon:
					action.legsWon !== undefined ? action.legsWon : state.legsWon,
			};
		case CRICKET56_RESTORE:
			return {
				...state,
				score: action.score,
			};
		case CRICKET56_LEG_WIN:
			return { ...state, legsWon: state.legsWon + 1 };
		case CRICKET56_LEG_RESET:
			return {
				...state,
				score: 0,
			};
		default:
			return state;
	}
};
