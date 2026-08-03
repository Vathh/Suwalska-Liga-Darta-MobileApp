import { resetVisitDartLabels } from '../reducers/playerResultActions.js';

/**
 * Bookkeeping dla trybu rzut-po-rzucie (per-dart): historia rzutów bieżącej wizyty,
 * chronologiczny log zatwierdzonych wizyt oraz detekcja aktywnej wizyty w toku.
 * Wydzielone z GameScoringScreen — czyste funkcje operujące na refach przekazanych z ekranu.
 *
 * @param {object} deps
 */
export function createDartHistoryTracker({
	dartHistoryRef,
	visitLogRef,
	visitPointsTotalRef,
	visitStartScoreRef,
	visitClientIdRef,
	localVisitRemainingRef,
	playerDispatches,
	setLocalRemaining,
	currentPlayerIndexRef,
	isPerDartMode,
}) {
	const pushVisitLog = (playerIndex, visitScore, darts = null, { bust = false } = {}) => {
		visitLogRef.current.push({
			playerIndex,
			visitScore,
			darts: darts?.length ? [...darts] : null,
			bust,
		});
	};

	const getRecentVisitDartPoints = (playerIndex) => {
		const hist = dartHistoryRef.current;
		const points = [];
		for (let i = hist.length - 1; i >= 0 && points.length < 3; i -= 1) {
			const entry = hist[i];
			if (entry.playerIndex !== playerIndex || entry.completedVisit) {
				continue;
			}
			points.unshift(entry.points);
		}
		return points;
	};

	const discardInProgressPerDartVisit = () => {
		dartHistoryRef.current = dartHistoryRef.current.filter(
			(entry) => entry.completedVisit,
		);
		visitStartScoreRef.current = null;
		visitClientIdRef.current = null;
		visitPointsTotalRef.current = 0;
		setLocalRemaining(null);
		const idx = currentPlayerIndexRef.current;
		playerDispatches[idx](resetVisitDartLabels());
	};

	const pushDartToHistory = (playerIndex, points, label) => {
		dartHistoryRef.current.push({
			playerIndex,
			points,
			label,
			completedVisit: false,
		});
	};

	const popDartHistory = (count = 1) => {
		for (let i = 0; i < count; i += 1) {
			if (dartHistoryRef.current.length > 0) {
				dartHistoryRef.current.pop();
			}
		}
		if (count >= 3) {
			visitPointsTotalRef.current = 0;
		}
	};

	const markCurrentVisitCompleted = (playerIndex) => {
		const hist = dartHistoryRef.current;
		let marked = 0;
		for (let i = hist.length - 1; i >= 0 && marked < 3; i -= 1) {
			if (hist[i].playerIndex !== playerIndex || hist[i].completedVisit) {
				continue;
			}
			hist[i].completedVisit = true;
			marked += 1;
		}
	};

	const hasActivePerDartVisit = () =>
		isPerDartMode() &&
		(visitClientIdRef.current != null ||
			visitPointsTotalRef.current > 0 ||
			localVisitRemainingRef.current != null);

	return {
		pushVisitLog,
		getRecentVisitDartPoints,
		discardInProgressPerDartVisit,
		pushDartToHistory,
		popDartHistory,
		markCurrentVisitCompleted,
		hasActivePerDartVisit,
	};
}
