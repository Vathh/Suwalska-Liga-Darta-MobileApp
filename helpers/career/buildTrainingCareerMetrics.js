import { sectorFromLabel } from '../gameScoring/visitDarts';

const EMPTY_BUCKETS = { 180: 0, 170: 0, 140: 0, 100: 0, 80: 0, 60: 0 };

function visitBucket(score) {
	if (score === 180) return '180';
	if (score >= 170) return '170';
	if (score >= 140) return '140';
	if (score >= 100) return '100';
	if (score >= 80) return '80';
	if (score >= 60) return '60';
	return null;
}

function x01SectorsFromVisitLog(visitLog, playerIndex) {
	const counts = {};
	for (let n = 1; n <= 20; n += 1) counts[String(n)] = 0;
	counts['25'] = 0;
	counts['0'] = 0;
	let any = false;
	for (const visit of visitLog ?? []) {
		if (visit.playerIndex !== playerIndex || !Array.isArray(visit.darts)) continue;
		for (const dart of visit.darts) {
			any = true;
			const sector = dart.sector ?? sectorFromLabel(dart.label);
			const key = sector === 25 ? '25' : String(sector);
			if (counts[key] == null) counts['0'] += 1;
			else counts[key] += 1;
		}
	}
	return any ? counts : null;
}

export function buildX01TrainingMetrics(playerState, doubleStats, isPerDart, visitLog, playerIndex) {
	const darts = Number(playerState?.totalDartsThrown ?? playerState?.dartsThrown ?? 0);
	const points = Number(playerState?.totalPointsEarned ?? 0);
	if (!Number.isFinite(darts) || darts <= 0) {
		return null;
	}
	const visit_scores = { ...EMPTY_BUCKETS };
	const groups = [...(playerState?.legByLegScores ?? [])];
	if (playerState?.currentLegScores?.length) {
		groups.push(playerState.currentLegScores);
	}
	for (const visits of groups) {
		for (const score of visits ?? []) {
			const key = visitBucket(Number(score) || 0);
			if (key) visit_scores[key] += 1;
		}
	}
	const closed_legs = (playerState?.dartsPerLeg ?? [])
		.map((n) => ({ darts: Number(n) || 0 }))
		.filter((row) => row.darts > 0);
	const checkouts = closed_legs.map((row, i) => {
		const visits = playerState?.legByLegScores?.[i] ?? [];
		const score = visits.length ? Number(visits[visits.length - 1]) || 0 : 0;
		return { score, darts: ((row.darts - 1) % 3) + 1 };
	});
	const best = closed_legs.length
		? Math.min(...closed_legs.map((row) => row.darts))
		: null;
	const tracked = !!isPerDart;
	return {
		darts_thrown: darts,
		points: Number.isFinite(points) ? points : 0,
		double_tracked: tracked,
		double_attempts: tracked ? (doubleStats?.attempts ?? 0) : null,
		double_successes: tracked ? (doubleStats?.successes ?? 0) : null,
		visit_scores,
		closed_legs,
		checkouts,
		best_leg_darts: best,
		sectors: tracked ? x01SectorsFromVisitLog(visitLog, playerIndex) : null,
	};
}

export function buildEventLogTrainingMetrics(gameType, eventLog, playerId, extra = {}) {
	return {
		player_id: playerId,
		dart_log: eventLog ?? [],
		...extra,
	};
}
