export const CRICKET_APPLY = 'CRICKET_APPLY';
export const CRICKET_RESTORE = 'CRICKET_RESTORE';
export const CRICKET_LEG_WIN = 'CRICKET_LEG_WIN';
export const CRICKET_LEG_RESET = 'CRICKET_LEG_RESET';
export const CRICKET_SYNC_META = 'CRICKET_SYNC_META';

export const initialCricketState = () => ({
	hits: { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, bull: 0 },
	points: 0,
	legsWon: 0,
});

export const cricketReducer = (state, action) => {
	switch (action.type) {
		case CRICKET_APPLY:
			return {
				...state,
				hits: action.hits,
				points: action.points,
				legsWon:
					action.legsWon !== undefined ? action.legsWon : state.legsWon,
			};
		case CRICKET_SYNC_META:
			return {
				...state,
				legsWon:
					action.legsWon !== undefined ? action.legsWon : state.legsWon,
			};
		case CRICKET_RESTORE:
			return {
				...state,
				hits: action.hits,
				points: action.points,
			};
		case CRICKET_LEG_WIN:
			return { ...state, legsWon: state.legsWon + 1 };
		case CRICKET_LEG_RESET:
			return {
				...state,
				hits: { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, bull: 0 },
				points: 0,
			};
		default:
			return state;
	}
};
