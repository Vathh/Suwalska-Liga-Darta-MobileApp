export const ATC_APPLY = 'ATC_APPLY';
export const ATC_RESTORE = 'ATC_RESTORE';
export const ATC_LEG_WIN = 'ATC_LEG_WIN';
export const ATC_LEG_RESET = 'ATC_LEG_RESET';

export const initialAtcState = () => ({
	targetIndex: 0,
	finished: false,
	legsWon: 0,
});

export const atcReducer = (state, action) => {
	switch (action.type) {
		case ATC_APPLY:
			return {
				...state,
				targetIndex: action.targetIndex,
				finished: action.finished ?? false,
				legsWon:
					action.legsWon !== undefined ? action.legsWon : state.legsWon,
			};
		case ATC_RESTORE:
			return {
				...state,
				targetIndex: action.targetIndex,
				finished: action.finished ?? false,
			};
		case ATC_LEG_WIN:
			return { ...state, legsWon: state.legsWon + 1 };
		case ATC_LEG_RESET:
			return {
				...state,
				targetIndex: 0,
				finished: false,
			};
		default:
			return state;
	}
};
