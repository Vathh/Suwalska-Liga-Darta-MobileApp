export const BOB27_APPLY = 'BOB27_APPLY';
export const BOB27_RESTORE = 'BOB27_RESTORE';
export const BOB27_LEG_WIN = 'BOB27_LEG_WIN';
export const BOB27_LEG_RESET = 'BOB27_LEG_RESET';

export const initialBob27State = () => ({
	score: 27,
	eliminated: false,
	legsWon: 0,
});

export const bob27Reducer = (state, action) => {
	switch (action.type) {
		case BOB27_APPLY:
			return {
				...state,
				score: action.score,
				eliminated: action.eliminated ?? state.eliminated,
				legsWon:
					action.legsWon !== undefined ? action.legsWon : state.legsWon,
			};
		case BOB27_RESTORE:
			return {
				...state,
				score: action.score,
				eliminated: action.eliminated ?? false,
			};
		case BOB27_LEG_WIN:
			return { ...state, legsWon: state.legsWon + 1 };
		case BOB27_LEG_RESET:
			return {
				...state,
				score: 27,
				eliminated: false,
			};
		default:
			return state;
	}
};
