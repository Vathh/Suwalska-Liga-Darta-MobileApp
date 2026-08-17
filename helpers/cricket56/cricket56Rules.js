export const CRICKET56_ROUND_COUNT = 7;
export const CRICKET56_LAST_ROUND_INDEX = 6;
export const CRICKET56_PERFECT_SCORE = 60;

export const CRICKET56_KIND_CONTINUE = 'continue';
export const CRICKET56_KIND_WIN = 'win';
export const CRICKET56_KIND_TIE_RESET = 'tie_reset';

export function cricket56Targets() {
	return [15, 16, 17, 18, 19, 20, 'bull'];
}

export function cricket56TargetAt(index) {
	const targets = cricket56Targets();
	return targets[index] ?? 'bull';
}

export function cricket56IsBull(index) {
	return cricket56TargetAt(index) === 'bull';
}

export function cricket56MaxMarkForRound(index) {
	return cricket56IsBull(index) ? 2 : 3;
}

export function cricket56MaxPointsForRound(index) {
	return 3 * cricket56MaxMarkForRound(index);
}

export function cricket56TargetLabel(index) {
	const target = cricket56TargetAt(index);
	return target === 'bull' ? 'Bull' : String(target);
}

export function cricket56ClampMark(mark, roundIndex) {
	const n = Number(mark);
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(cricket56MaxMarkForRound(roundIndex), Math.floor(n)));
}

export function cricket56ClampPoints(points, roundIndex) {
	const n = Number(points);
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(cricket56MaxPointsForRound(roundIndex), Math.floor(n)));
}

export function applyCricket56Visit(scoreBefore, points, roundIndex) {
	return (Number(scoreBefore) || 0) + cricket56ClampPoints(points, roundIndex);
}

export function emptyCricket56Board() {
	return { score: 0 };
}

export function cricket56ActiveIndices(boards, leftIndices = []) {
	const left = new Set(leftIndices);
	const out = [];
	(boards ?? []).forEach((board, i) => {
		if (left.has(i)) return;
		out.push(i);
	});
	return out;
}

export function cricket56AllActiveHaveThrown(boards, thrownThisRound, leftIndices = []) {
	const active = cricket56ActiveIndices(boards, leftIndices);
	if (active.length === 0) return true;
	return active.every(
		(i) => thrownThisRound?.[i] || thrownThisRound?.[String(i)],
	);
}

export function cricket56HighestScoreIndex(boards, leftIndices = []) {
	const active = cricket56ActiveIndices(boards, leftIndices);
	if (active.length === 0) return null;
	let bestIdx = active[0];
	let bestScore = boards[bestIdx]?.score ?? 0;
	let tied = false;
	for (const i of active) {
		if (i === bestIdx) continue;
		const score = boards[i]?.score ?? 0;
		if (score > bestScore) {
			bestIdx = i;
			bestScore = score;
			tied = false;
		} else if (score === bestScore) {
			tied = true;
		}
	}
	return tied ? null : bestIdx;
}

export function resolveCricket56AfterCompletedVisit(
	boards,
	currentRoundIndex,
	thrownThisRound,
	leftIndices = [],
) {
	if (!cricket56AllActiveHaveThrown(boards, thrownThisRound, leftIndices)) {
		return { kind: CRICKET56_KIND_CONTINUE };
	}
	if (currentRoundIndex >= CRICKET56_LAST_ROUND_INDEX) {
		const winner = cricket56HighestScoreIndex(boards, leftIndices);
		if (winner == null) return { kind: CRICKET56_KIND_TIE_RESET };
		return { kind: CRICKET56_KIND_WIN, winnerIndex: winner };
	}
	return { kind: CRICKET56_KIND_CONTINUE };
}

export function isCricket56GameType(gameType) {
	const raw = String(gameType ?? '').toLowerCase();
	return raw === 'cricket56'
		|| raw === 'cricket_56'
		|| raw === 'cricket-56'
		|| raw === 'cricket60'
		|| raw === 'cricket_60'
		|| raw === 'cricketsequence'
		|| raw === 'cricket_sequence';
}
