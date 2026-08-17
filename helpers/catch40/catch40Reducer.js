export const CATCH40_APPLY = 'CATCH40_APPLY';
export const CATCH40_RESTORE = 'CATCH40_RESTORE';
export const CATCH40_LEG_WIN = 'CATCH40_LEG_WIN';
export const CATCH40_LEG_RESET = 'CATCH40_LEG_RESET';

export const initialCatch40State = () => ({
	outNumber: 61,
	remaining: 61,
	dartsUsed: 0,
	catch40Score: 0,
	finished: false,
	legsWon: 0,
});

export const catch40Reducer = (state, action) => {
	switch (action.type) {
		case CATCH40_APPLY:
			return {
				...state,
				outNumber: action.outNumber ?? state.outNumber,
				remaining: action.remaining ?? state.remaining,
				dartsUsed: action.dartsUsed ?? state.dartsUsed,
				catch40Score: action.catch40Score ?? state.catch40Score,
				finished: action.finished ?? false,
				legsWon:
					action.legsWon !== undefined ? action.legsWon : state.legsWon,
			};
		case CATCH40_RESTORE:
			return {
				...state,
				outNumber: action.outNumber,
				remaining: action.remaining,
				dartsUsed: action.dartsUsed,
				catch40Score: action.catch40Score,
				finished: action.finished ?? false,
			};
		case CATCH40_LEG_WIN:
			return { ...state, legsWon: state.legsWon + 1 };
		case CATCH40_LEG_RESET:
			return {
				...state,
				outNumber: 61,
				remaining: 61,
				dartsUsed: 0,
				catch40Score: 0,
				finished: false,
			};
		default:
			return state;
	}
};
