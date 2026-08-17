export const CATCH40_FIRST_OUT = 61;
export const CATCH40_LAST_OUT = 100;
export const CATCH40_OUT_COUNT = 40;
export const CATCH40_MAX_DARTS_PER_OUT = 6;
export const CATCH40_MAX_SCORE = 120;

export const CATCH40_KIND_CONTINUE = 'continue';
export const CATCH40_KIND_WIN = 'win';
export const CATCH40_KIND_TIE_RESET = 'tie_reset';

export function catch40PointsForCheckout(outNumber, dartsUsed) {
	if (dartsUsed < 2 || dartsUsed > CATCH40_MAX_DARTS_PER_OUT) return 0;
	if (outNumber === 99 && dartsUsed === 3) return 3;
	if (dartsUsed === 2) return 3;
	if (dartsUsed === 3) return 2;
	return 1;
}

export function catch40NextOut(outNumber) {
	if (outNumber >= CATCH40_LAST_OUT) return null;
	return outNumber + 1;
}

export function emptyCatch40Board() {
	return {
		outNumber: CATCH40_FIRST_OUT,
		remaining: CATCH40_FIRST_OUT,
		dartsUsed: 0,
		catch40Score: 0,
		finished: false,
	};
}

export function catch40CheckoutDartOptions(outNumber, dartsUsed) {
	if (dartsUsed >= 3) return [1, 2, 3];
	if (outNumber === 99) return [3];
	return [2, 3];
}

function advanceOut(outNumber, catch40Score) {
	const next = catch40NextOut(outNumber);
	if (next == null) {
		return {
			outNumber: CATCH40_LAST_OUT,
			remaining: 0,
			dartsUsed: 0,
			catch40Score,
			finished: true,
		};
	}
	return {
		outNumber: next,
		remaining: next,
		dartsUsed: 0,
		catch40Score,
		finished: false,
	};
}

export function applyCatch40Visit(
	board,
	{ score, remainingAfter, dartsInVisit, bust, checkout },
) {
	if (board?.finished) return { ...emptyCatch40Board(), ...board };
	const outNumber = board?.outNumber ?? CATCH40_FIRST_OUT;
	const remainingBefore = board?.remaining ?? outNumber;
	const dartsUsed = board?.dartsUsed ?? 0;
	let catch40Score = board?.catch40Score ?? 0;
	const parsedDarts = Number(dartsInVisit);
	const darts = Number.isFinite(parsedDarts) && parsedDarts > 0
		? Math.min(3, Math.floor(parsedDarts))
		: 3;
	const totalDarts = dartsUsed + darts;

	if (checkout) {
		catch40Score += catch40PointsForCheckout(outNumber, totalDarts);
		return advanceOut(outNumber, catch40Score);
	}

	const remaining = bust ? remainingBefore : remainingAfter;
	if (totalDarts >= CATCH40_MAX_DARTS_PER_OUT) {
		return advanceOut(outNumber, catch40Score);
	}

	return {
		outNumber,
		remaining,
		dartsUsed: totalDarts,
		catch40Score,
		finished: false,
	};
}

export function catch40ActiveIndices(boards, leftIndices = []) {
	const left = new Set(leftIndices);
	const out = [];
	(boards ?? []).forEach((board, i) => {
		if (left.has(i)) return;
		out.push(i);
	});
	return out;
}

export function catch40HighestScoreIndex(boards, leftIndices = []) {
	const active = catch40ActiveIndices(boards, leftIndices);
	if (active.length === 0) return null;
	let bestIdx = active[0];
	let bestScore = boards[bestIdx]?.catch40Score ?? 0;
	let tied = false;
	for (const i of active) {
		if (i === bestIdx) continue;
		const score = boards[i]?.catch40Score ?? 0;
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

export function resolveCatch40AfterVisit(boards, leftIndices = []) {
	const active = catch40ActiveIndices(boards, leftIndices);
	if (active.some((i) => !boards[i]?.finished)) {
		return { kind: CATCH40_KIND_CONTINUE };
	}
	const winner = catch40HighestScoreIndex(boards, leftIndices);
	if (winner == null) return { kind: CATCH40_KIND_TIE_RESET };
	return { kind: CATCH40_KIND_WIN, winnerIndex: winner };
}

export function isCatch40GameType(gameType) {
	const raw = String(gameType ?? '').toLowerCase();
	return raw === 'catch40' || raw === 'catch_40' || raw === 'catch-40';
}
