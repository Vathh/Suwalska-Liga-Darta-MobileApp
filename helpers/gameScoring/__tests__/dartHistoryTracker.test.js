import { createDartHistoryTracker } from '../dartHistoryTracker.js';
import { RESET_VISIT_DART_LABELS } from '../../reducers/playerResultActions.js';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function makeTracker(overrides = {}) {
	const dartHistoryRef = { current: [] };
	const visitLogRef = { current: [] };
	const visitPointsTotalRef = { current: 0 };
	const visitStartScoreRef = { current: null };
	const visitClientIdRef = { current: null };
	const localVisitRemainingRef = { current: null };
	const currentPlayerIndexRef = { current: 0 };
	const setLocalRemainingCalls = [];
	const dispatched = [[], []];

	const tracker = createDartHistoryTracker({
		dartHistoryRef,
		visitLogRef,
		visitPointsTotalRef,
		visitStartScoreRef,
		visitClientIdRef,
		localVisitRemainingRef,
		playerDispatches: [
			(action) => dispatched[0].push(action),
			(action) => dispatched[1].push(action),
		],
		setLocalRemaining: (v) => setLocalRemainingCalls.push(v),
		currentPlayerIndexRef,
		isPerDartMode: () => true,
		...overrides,
	});

	return {
		...tracker,
		refs: {
			dartHistoryRef,
			visitLogRef,
			visitPointsTotalRef,
			visitStartScoreRef,
			visitClientIdRef,
			localVisitRemainingRef,
			currentPlayerIndexRef,
		},
		dispatched,
		setLocalRemainingCalls,
	};
}

function testPushVisitLogWithDarts() {
	const { pushVisitLog, refs } = makeTracker();
	pushVisitLog(0, 60, [20, 20, 20]);
	assert(refs.visitLogRef.current.length === 1, 'one entry logged');
	const entry = refs.visitLogRef.current[0];
	assert(entry.playerIndex === 0, 'playerIndex recorded');
	assert(entry.visitScore === 60, 'visitScore recorded');
	assert(Array.isArray(entry.darts) && entry.darts.length === 3, 'darts copied');
	assert(entry.bust === false, 'bust defaults to false');
}

function testPushVisitLogWithoutDartsIsNull() {
	const { pushVisitLog, refs } = makeTracker();
	pushVisitLog(1, 0, null, { bust: true });
	assert(refs.visitLogRef.current[0].darts === null, 'no darts -> null');
	assert(refs.visitLogRef.current[0].bust === true, 'bust flag honored');
}

function testPushDartToHistoryAppendsInProgress() {
	const { pushDartToHistory, refs } = makeTracker();
	pushDartToHistory(0, 20, 'S20');
	assert(refs.dartHistoryRef.current.length === 1, 'dart pushed');
	assert(refs.dartHistoryRef.current[0].completedVisit === false, 'new dart is not completed');
}

function testGetRecentVisitDartPointsSkipsCompletedAndOtherPlayers() {
	const { pushDartToHistory, markCurrentVisitCompleted, getRecentVisitDartPoints } = makeTracker();
	pushDartToHistory(0, 20, 'S20');
	pushDartToHistory(0, 20, 'S20');
	markCurrentVisitCompleted(0);
	pushDartToHistory(1, 5, 'S5');
	pushDartToHistory(0, 19, 'S19');
	pushDartToHistory(0, 19, 'S19');
	const points = getRecentVisitDartPoints(0);
	assert(points.length === 2, `expected 2 in-progress darts for player 0, got ${points.length}`);
	assert(points[0] === 19 && points[1] === 19, 'only current in-progress visit darts returned in order');
}

function testGetRecentVisitDartPointsCapsAtThree() {
	const { pushDartToHistory, getRecentVisitDartPoints } = makeTracker();
	pushDartToHistory(0, 1, 'S1');
	pushDartToHistory(0, 2, 'S2');
	pushDartToHistory(0, 3, 'S3');
	const points = getRecentVisitDartPoints(0);
	assert(points.length === 3, 'capped at 3 darts');
	assert(points.join(',') === '1,2,3', 'preserves chronological order');
}

function testPopDartHistoryRemovesFromEnd() {
	const { pushDartToHistory, popDartHistory, refs } = makeTracker();
	pushDartToHistory(0, 1, 'S1');
	pushDartToHistory(0, 2, 'S2');
	popDartHistory(1);
	assert(refs.dartHistoryRef.current.length === 1, 'one dart removed');
	assert(refs.dartHistoryRef.current[0].points === 1, 'last dart removed, first remains');
}

function testPopDartHistoryResetsPointsTotalOnFullVisitUndo() {
	const { pushDartToHistory, popDartHistory, refs } = makeTracker();
	refs.visitPointsTotalRef.current = 45;
	pushDartToHistory(0, 15, 'S15');
	pushDartToHistory(0, 15, 'S15');
	pushDartToHistory(0, 15, 'S15');
	popDartHistory(3);
	assert(refs.visitPointsTotalRef.current === 0, 'points total reset when undoing 3+ darts');
	assert(refs.dartHistoryRef.current.length === 0, 'all darts removed');
}

function testMarkCurrentVisitCompletedOnlyAffectsGivenPlayerRecentDarts() {
	const { pushDartToHistory, markCurrentVisitCompleted, refs } = makeTracker();
	pushDartToHistory(0, 1, 'S1');
	pushDartToHistory(1, 2, 'S2');
	pushDartToHistory(0, 3, 'S3');
	markCurrentVisitCompleted(0);
	const player0Entries = refs.dartHistoryRef.current.filter((e) => e.playerIndex === 0);
	assert(player0Entries.every((e) => e.completedVisit), 'player 0 darts marked completed');
	const player1Entry = refs.dartHistoryRef.current.find((e) => e.playerIndex === 1);
	assert(player1Entry.completedVisit === false, 'other player darts untouched');
}

function testDiscardInProgressPerDartVisitClearsStateAndDispatches() {
	const { pushDartToHistory, discardInProgressPerDartVisit, refs, dispatched, setLocalRemainingCalls } =
		makeTracker();
	refs.visitStartScoreRef.current = 501;
	refs.visitClientIdRef.current = 'abc';
	refs.visitPointsTotalRef.current = 40;
	refs.localVisitRemainingRef.current = 461;
	refs.currentPlayerIndexRef.current = 1;
	pushDartToHistory(1, 20, 'S20');

	discardInProgressPerDartVisit();

	assert(refs.dartHistoryRef.current.length === 0, 'in-progress dart discarded');
	assert(refs.visitStartScoreRef.current === null, 'visitStartScoreRef reset');
	assert(refs.visitClientIdRef.current === null, 'visitClientIdRef reset');
	assert(refs.visitPointsTotalRef.current === 0, 'visitPointsTotalRef reset');
	assert(setLocalRemainingCalls.at(-1) === null, 'setLocalRemaining called with null');
	assert(dispatched[1].length === 1, 'dispatch sent to current player index');
	assert(dispatched[1][0].type === RESET_VISIT_DART_LABELS, 'resetVisitDartLabels dispatched');
	assert(dispatched[0].length === 0, 'other player not dispatched');
}

function testDiscardInProgressPerDartVisitKeepsCompletedDarts() {
	const { pushDartToHistory, markCurrentVisitCompleted, discardInProgressPerDartVisit, refs } = makeTracker();
	pushDartToHistory(0, 20, 'S20');
	pushDartToHistory(0, 20, 'S20');
	pushDartToHistory(0, 20, 'S20');
	markCurrentVisitCompleted(0);
	pushDartToHistory(0, 5, 'S5');

	discardInProgressPerDartVisit();

	assert(refs.dartHistoryRef.current.length === 3, 'completed visit darts preserved');
	assert(
		refs.dartHistoryRef.current.every((e) => e.completedVisit),
		'only completed darts remain',
	);
}

function testHasActivePerDartVisitFalseWhenNotPerDartMode() {
	const { hasActivePerDartVisit, refs } = makeTracker({ isPerDartMode: () => false });
	refs.visitClientIdRef.current = 'abc';
	assert(hasActivePerDartVisit() === false, 'not per-dart mode => never active');
}

function testHasActivePerDartVisitTrueWhenClientIdSet() {
	const { hasActivePerDartVisit, refs } = makeTracker();
	refs.visitClientIdRef.current = 'abc';
	assert(hasActivePerDartVisit() === true, 'active when visitClientIdRef set');
}

function testHasActivePerDartVisitTrueWhenPointsAccrued() {
	const { hasActivePerDartVisit, refs } = makeTracker();
	refs.visitPointsTotalRef.current = 20;
	assert(hasActivePerDartVisit() === true, 'active when points accrued');
}

function testHasActivePerDartVisitTrueWhenLocalRemainingSet() {
	const { hasActivePerDartVisit, refs } = makeTracker();
	refs.localVisitRemainingRef.current = 400;
	assert(hasActivePerDartVisit() === true, 'active when local remaining set');
}

function testHasActivePerDartVisitFalseWhenClean() {
	const { hasActivePerDartVisit } = makeTracker();
	assert(hasActivePerDartVisit() === false, 'inactive with no state');
}

export function runDartHistoryTrackerTests() {
	testPushVisitLogWithDarts();
	testPushVisitLogWithoutDartsIsNull();
	testPushDartToHistoryAppendsInProgress();
	testGetRecentVisitDartPointsSkipsCompletedAndOtherPlayers();
	testGetRecentVisitDartPointsCapsAtThree();
	testPopDartHistoryRemovesFromEnd();
	testPopDartHistoryResetsPointsTotalOnFullVisitUndo();
	testMarkCurrentVisitCompletedOnlyAffectsGivenPlayerRecentDarts();
	testDiscardInProgressPerDartVisitClearsStateAndDispatches();
	testDiscardInProgressPerDartVisitKeepsCompletedDarts();
	testHasActivePerDartVisitFalseWhenNotPerDartMode();
	testHasActivePerDartVisitTrueWhenClientIdSet();
	testHasActivePerDartVisitTrueWhenPointsAccrued();
	testHasActivePerDartVisitTrueWhenLocalRemainingSet();
	testHasActivePerDartVisitFalseWhenClean();
}
