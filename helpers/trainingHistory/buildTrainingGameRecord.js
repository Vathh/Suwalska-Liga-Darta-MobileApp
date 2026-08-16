/**
 * Statystyki jednego gracza z zakończonego meczu X01 (trening).
 * Bazuje na tej samej logice co components/Game/Stats.jsx.
 */

import { findWinnerIndex } from '../matchFormat/matchFormat.js';

const legScoreGroups = (legByLegScores, currentLegScores) => {
	const groups = [...(legByLegScores ?? [])];
	if (currentLegScores?.length) {
		groups.push(currentLegScores);
	}
	return groups;
};

const getThrowsBetween = (arrayOfArrays, min, max) =>
	(arrayOfArrays || []).reduce((acc, arr) => {
		const count = (arr || []).filter((v) => v >= min && v < max).length;
		return acc + count;
	}, 0);

const getMax180 = (arrayOfArrays) =>
	(arrayOfArrays || []).reduce((acc, arr) => {
		const count = (arr || []).filter((v) => v === 180).length;
		return acc + count;
	}, 0);

/** Lotka checkoutu z łącznej liczby lotek w legi (1–3). */
export function checkoutDartFromLegDarts(dartsInLeg) {
	const d = Number(dartsInLeg);
	if (!Number.isFinite(d) || d < 1) return null;
	return ((d - 1) % 3) + 1;
}

export function computeX01PlayerMatchStats(playerState) {
	const groups = legScoreGroups(
		playerState?.legByLegScores,
		playerState?.currentLegScores,
	);
	const dartsPerLeg = playerState?.dartsPerLeg ?? [];
	const checkoutDarts = dartsPerLeg
		.map(checkoutDartFromLegDarts)
		.filter((d) => d != null);
	const checkoutDartCounts = { 1: 0, 2: 0, 3: 0 };
	for (const d of checkoutDarts) {
		checkoutDartCounts[d] += 1;
	}

	const legsAverages = playerState?.legsAverages ?? [];
	const bestLegAverage =
		legsAverages.length > 0 ? Math.max(...legsAverages.map(Number)) : null;
	const bestLegDarts =
		dartsPerLeg.length > 0 ? Math.min(...dartsPerLeg.map(Number)) : null;

	const matchAverageRaw = playerState?.matchAverage;
	const matchAverage =
		matchAverageRaw != null && matchAverageRaw !== ''
			? Number(matchAverageRaw)
			: null;

	return {
		legsWon: playerState?.legsWon ?? 0,
		setsWon: playerState?.setsWon ?? 0,
		matchAverage: Number.isFinite(matchAverage) ? matchAverage : null,
		bestLegAverage: Number.isFinite(bestLegAverage) ? bestLegAverage : null,
		bestLegDarts: Number.isFinite(bestLegDarts) ? bestLegDarts : null,
		totalPointsEarned: playerState?.totalPointsEarned ?? 0,
		totalDartsThrown: playerState?.totalDartsThrown ?? 0,
		checkoutDarts,
		checkoutDartCounts,
		plus60: getThrowsBetween(groups, 60, 80),
		plus80: getThrowsBetween(groups, 80, 100),
		plus100: getThrowsBetween(groups, 100, 140),
		plus140: getThrowsBetween(groups, 140, 180),
		max180: getMax180(groups),
	};
}

/**
 * Przegląd legów: średnia każdego gracza + ile lotek potrzebował zwycięzca na cały leg.
 */
export function buildX01LegsBreakdown(players, playerStates, matchFormat) {
	const startingScore = Number(matchFormat?.startingScore) || 501;
	const states = playerStates ?? [];
	const legCount = Math.max(
		0,
		...states.map((s) => s?.legsAverages?.length ?? 0),
		...states.map((s) => s?.legByLegScores?.length ?? 0),
	);
	if (legCount === 0) return [];

	const dartsQueues = states.map((s) => [...(s?.dartsPerLeg ?? [])]);

	const legs = [];
	for (let li = 0; li < legCount; li += 1) {
		const rowPlayers = (players ?? []).map((p, i) => {
			const name = (p?.name ?? `Gracz ${i + 1}`).trim() || `Gracz ${i + 1}`;
			const visits = states[i]?.legByLegScores?.[li] ?? [];
			const points = (visits || []).reduce((acc, v) => acc + Number(v || 0), 0);
			const avgRaw = states[i]?.legsAverages?.[li];
			const average =
				avgRaw != null && avgRaw !== '' && Number.isFinite(Number(avgRaw))
					? Number(avgRaw)
					: null;
			return { name, average, points };
		});

		let winnerIdx = rowPlayers.findIndex((rp) => rp.points === startingScore);
		if (winnerIdx < 0) {
			winnerIdx = rowPlayers.reduce((best, rp, i) => {
				if (best < 0) return i;
				return rp.points > rowPlayers[best].points ? i : best;
			}, -1);
		}

		let dartsToFinish = null;
		if (winnerIdx >= 0 && dartsQueues[winnerIdx]?.length > 0) {
			const darts = Number(dartsQueues[winnerIdx].shift());
			dartsToFinish = Number.isFinite(darts) && darts > 0 ? darts : null;
		}

		legs.push({
			legNumber: li + 1,
			winnerName: winnerIdx >= 0 ? rowPlayers[winnerIdx]?.name ?? null : null,
			dartsToFinish,
			players: rowPlayers.map(({ name, average }) => ({ name, average })),
		});
	}

	return legs;
}

export function buildTrainingGameRecord({
	players,
	playerStates,
	matchFormat,
	gameType = 'x01',
	cricketStates = null,
	bob27States = null,
}) {
	const playedAt = new Date().toISOString();
	const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	const isCricket = gameType === 'cricket';
	const isBob27 = gameType === 'bob27';
	const hideX01Stats = isCricket || isBob27;

	const playerRecords = (players ?? []).map((p, i) => {
		const name = (p?.name ?? `Gracz ${i + 1}`).trim() || `Gracz ${i + 1}`;
		if (isCricket) {
			const legsWon = cricketStates?.[i]?.legsWon ?? 0;
			return {
				name,
				legsWon,
				setsWon: 0,
				matchAverage: null,
				bestLegAverage: null,
				bestLegDarts: null,
				totalPointsEarned: 0,
				totalDartsThrown: 0,
				checkoutDarts: [],
				checkoutDartCounts: { 1: 0, 2: 0, 3: 0 },
				plus60: 0,
				plus80: 0,
				plus100: 0,
				plus140: 0,
				max180: 0,
			};
		}
		if (isBob27) {
			const legsWon = bob27States?.[i]?.legsWon ?? 0;
			return {
				name,
				legsWon,
				setsWon: 0,
				score: bob27States?.[i]?.score ?? null,
				matchAverage: null,
				bestLegAverage: null,
				bestLegDarts: null,
				totalPointsEarned: 0,
				totalDartsThrown: 0,
				checkoutDarts: [],
				checkoutDartCounts: { 1: 0, 2: 0, 3: 0 },
				plus60: 0,
				plus80: 0,
				plus100: 0,
				plus140: 0,
				max180: 0,
			};
		}
		return {
			name,
			...computeX01PlayerMatchStats(playerStates?.[i]),
		};
	});

	let winnerName = null;
	if (isCricket || isBob27) {
		let maxLegs = -1;
		for (const pr of playerRecords) {
			if ((pr.legsWon ?? 0) > maxLegs) {
				maxLegs = pr.legsWon ?? 0;
				winnerName = pr.name;
			}
		}
	} else {
		const winnerIdx = findWinnerIndex(playerStates, matchFormat);
		winnerName =
			winnerIdx >= 0
				? playerRecords[winnerIdx]?.name ?? null
				: playerRecords.find((p) => (p.legsWon ?? 0) > 0)?.name ?? null;
	}

	const legs = hideX01Stats
		? []
		: buildX01LegsBreakdown(players, playerStates, matchFormat);

	return {
		id,
		playedAt,
		gameType: isCricket ? 'cricket' : isBob27 ? 'bob27' : 'x01',
		matchFormat: matchFormat ?? null,
		winnerName,
		players: playerRecords,
		legs,
	};
}

export function formatTrainingGameTitle(game) {
	const names = (game?.players ?? []).map((p) => p.name).filter(Boolean);
	if (names.length === 0) return 'Trening';
	if (names.length === 2) return `${names[0]} vs ${names[1]}`;
	return names.join(', ');
}

export function formatTrainingGameDate(iso) {
	if (!iso) return '';
	try {
		return new Date(iso).toLocaleString('pl-PL', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return String(iso);
	}
}
