/** Segmenty standard cricket (scoring). */
export const CRICKET_SEGMENTS = [20, 19, 18, 17, 16, 15, 'bull'];

export function segmentPoints(segment) {
	return segment === 'bull' ? 25 : Number(segment);
}

export function isSegmentClosed(hits, segment) {
	return (hits?.[segment] ?? 0) >= 3;
}

export function allSegmentsClosed(hits) {
	return CRICKET_SEGMENTS.every((seg) => isSegmentClosed(hits, seg));
}

/**
 * Pole martwe, gdy wszyscy gracze je zamknęli.
 */
export function isSegmentClosedByAll(cricketStates, segment) {
	return (cricketStates ?? []).every((s) => isSegmentClosed(s?.hits, segment));
}

/**
 * Czy marka ponad 3 daje punkty: własny gracz już zamknięty, co najmniej jeden przeciwnik otwarty.
 */
export function canScoreMark(hitsList, playerIndex, segment) {
	const ownClosed = isSegmentClosed(hitsList[playerIndex], segment);
	if (!ownClosed) {
		return false;
	}
	return hitsList.some(
		(hits, i) => i !== playerIndex && !isSegmentClosed(hits, segment),
	);
}

/**
 * Aplikuje jedną lotkę (segment × multiplier) na kopii hitów gracza.
 * Marki liczone pojedynczo (np. T20 przy 2 markach = zamknięcie + 2× punkty).
 *
 * @returns {{ hits: object, pointsScored: number }}
 */
export function applyCricketDart(hitsList, playerIndex, segment, multiplier) {
	const nextHits = hitsList.map((h) => ({ ...h }));
	let pointsScored = 0;
	const marks = Math.max(1, Math.min(3, Number(multiplier) || 1));
	const value = segmentPoints(segment);

	for (let m = 0; m < marks; m += 1) {
		const current = nextHits[playerIndex][segment] ?? 0;
		if (current < 3) {
			nextHits[playerIndex][segment] = current + 1;
			continue;
		}
		if (canScoreMark(nextHits, playerIndex, segment)) {
			nextHits[playerIndex][segment] = current + 1;
			pointsScored += value;
		}
		// martwe — bez marki i bez punktów
	}

	return { hits: nextHits[playerIndex], pointsScored };
}

/**
 * Zwycięzca lega: wszystkie pola zamknięte i ściśle więcej punktów niż każdy inny.
 * Remis punktów → null (leg trwa).
 */
export function findCricketLegWinnerIndex(cricketStates) {
	const states = cricketStates ?? [];
	for (let i = 0; i < states.length; i += 1) {
		const s = states[i];
		if (!allSegmentsClosed(s?.hits)) {
			continue;
		}
		const pts = s?.points ?? 0;
		const leadsAll = states.every(
			(other, j) => j === i || pts > (other?.points ?? 0),
		);
		if (leadsAll) {
			return i;
		}
	}
	return null;
}

export function isCricketMatchWon(legsWon, legsToWin) {
	return (legsWon ?? 0) >= (legsToWin ?? 1);
}

export function findCricketMatchWinnerIndex(cricketStates, legsToWin) {
	return (cricketStates ?? []).findIndex((s) =>
		isCricketMatchWon(s?.legsWon, legsToWin),
	);
}

export function isCricketGameType(gameType) {
	return String(gameType ?? '').toLowerCase() === 'cricket';
}

/** API zwraca klucze string ('20'); UI/reducer używa liczb + 'bull'. */
export function normalizeCricketHits(hits) {
	const out = { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, bull: 0 };
	if (!hits || typeof hits !== 'object') {
		return out;
	}
	for (const seg of CRICKET_SEGMENTS) {
		const key = seg === 'bull' ? 'bull' : String(seg);
		const val = hits[seg] ?? hits[key];
		out[seg] = Number(val ?? 0);
	}
	return out;
}
