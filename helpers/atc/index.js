export {
	ATC_APPLY,
	ATC_RESTORE,
	ATC_LEG_WIN,
	ATC_LEG_RESET,
	initialAtcState,
	atcReducer,
} from './atcReducer.js';

export {
	ATC_TARGET_COUNT,
	ATC_LAST_TARGET_INDEX,
	ATC_FINISHED_INDEX,
	ATC_KIND_CONTINUE,
	ATC_KIND_WIN,
	atcTargetLabel,
	atcMaxHits,
	clampAtcHits,
	applyAtcVisit,
	emptyAtcBoard,
	isAtcGameType,
} from './atcRules.js';
