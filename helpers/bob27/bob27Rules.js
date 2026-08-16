export const BOB27_STARTING_SCORE = 27;
export const BOB27_MODE_EASY = 'easy';
export const BOB27_MODE_HARD = 'hard';
export const BOB27_TARGET_COUNT = 21;
export const BOB27_LAST_TARGET_INDEX = 20;
export const BOB27_BULL_VALUE = 50;

export const BOB27_KIND_CONTINUE = 'continue';
export const BOB27_KIND_WIN = 'win';
export const BOB27_KIND_TIE_RESET = 'tie_reset';
export const BOB27_KIND_BUST = 'bust';

export function bob27Targets() {
	const out = [];
	for (let n = 1; n <= 20; n += 1) out.push(n);
	out.push('bull');
	return out;
}

export function bob27TargetAt(index) {
	const targets = bob27Targets();
	return targets[index] ?? 'bull';
}

export function bob27TargetValue(index) {
	const target = bob27TargetAt(index);
	return target === 'bull' ? BOB27_BULL_VALUE : Number(target) * 2;
}

export function bob27TargetLabel(index) {
	const target = bob27TargetAt(index);
	return target === 'bull' ? 'Bull' : `D${target}`;
}

export function normalizeBob27Mode(mode) {
	return String(mode ?? '').toLowerCase() === BOB27_MODE_EASY
		? BOB27_MODE_EASY
		: BOB27_MODE_HARD;
}

export function applyBob27Visit(scoreBefore, hits, targetIndex) {
	const value = bob27TargetValue(targetIndex);
	const safeHits = Math.max(0, Math.min(3, Number(hits) || 0));
	if (safeHits === 0) return scoreBefore - value;
	return scoreBefore + safeHits * value;
}

export function shouldEliminateBob27(scoreAfter, mode) {
	return normalizeBob27Mode(mode) === BOB27_MODE_HARD && scoreAfter <= 0;
}

export function bob27PerfectScore() {
	let sum = BOB27_STARTING_SCORE;
	for (let i = 0; i < BOB27_TARGET_COUNT; i += 1) {
		sum += 3 * bob27TargetValue(i);
	}
	return sum;
}

export function emptyBob27Board() {
	return { score: BOB27_STARTING_SCORE, eliminated: false };
}

export function bob27ActiveIndices(boards, leftIndices = []) {
	const left = new Set(leftIndices);
	const out = [];
	(boards ?? []).forEach((board, i) => {
		if (left.has(i)) return;
		if (board?.eliminated) return;
		out.push(i);
	});
	return out;
}

export function bob27AllActiveHaveThrown(boards, thrownThisTarget, leftIndices = []) {
	const active = bob27ActiveIndices(boards, leftIndices);
	if (active.length === 0) return true;
	return active.every(
		(i) => thrownThisTarget?.[i] || thrownThisTarget?.[String(i)],
	);
}

export function bob27HighestScoreIndex(boards, leftIndices = []) {
	const active = bob27ActiveIndices(boards, leftIndices);
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

export function resolveBob27AfterCompletedVisit(
	boards,
	mode,
	currentTargetIndex,
	thrownThisTarget,
	leftIndices = [],
) {
	const normalizedMode = normalizeBob27Mode(mode);
	const active = bob27ActiveIndices(boards, leftIndices);

	if (normalizedMode === BOB27_MODE_HARD) {
		if (active.length === 1) {
			return { kind: BOB27_KIND_WIN, winnerIndex: active[0] };
		}
		if (active.length === 0) {
			return { kind: BOB27_KIND_BUST };
		}
	}

	if (!bob27AllActiveHaveThrown(boards, thrownThisTarget, leftIndices)) {
		return { kind: BOB27_KIND_CONTINUE };
	}

	if (currentTargetIndex >= BOB27_LAST_TARGET_INDEX) {
		const winner = bob27HighestScoreIndex(boards, leftIndices);
		if (winner == null) return { kind: BOB27_KIND_TIE_RESET };
		return { kind: BOB27_KIND_WIN, winnerIndex: winner };
	}

	return { kind: BOB27_KIND_CONTINUE };
}

export function isBob27GameType(gameType) {
	return String(gameType ?? '').toLowerCase() === 'bob27';
}
