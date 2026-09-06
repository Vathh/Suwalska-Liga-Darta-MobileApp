/**
 * Ile lotek zapisujemy w wizycie X01 (średnia 3-dartowa).
 *
 * Bust / overthrow zużywa całe podejście (zawsze 3), nawet gdy fizycznie
 * rzucono 1–2 lotki. Checkout na 1. lub 2. lotce — tyle, ile rzucono.
 */
export const BUST_VISIT_DARTS = 3;

export function sectorFromLabel(label) {
	if (label == null || label === '') return 0;
	const raw = String(label).trim();
	const upper = raw.toUpperCase();
	if (['0', 'MISS', 'OUT', '-'].includes(upper)) return 0;
	if (['BULL', 'DB', 'SB', 'B', '25', '50'].includes(upper)) return 25;
	const m = raw.match(/^[SDT]?(\d{1,2})$/i);
	if (m) {
		const n = Number(m[1]);
		if (n >= 1 && n <= 20) return n;
		if (n === 25) return 25;
	}
	return 0;
}

export function dartToPayload(entry) {
	return {
		sector: sectorFromLabel(entry?.label),
		points: Number(entry?.points) || 0,
		label: entry?.label ?? null,
		remainingBefore: entry?.remainingBefore ?? null,
		bust: !!entry?.bust,
	};
}

export function openVisitDarts(history, playerIndex) {
	const darts = [];
	const list = Array.isArray(history) ? history : [];
	for (let i = list.length - 1; i >= 0 && darts.length < 3; i -= 1) {
		const entry = list[i];
		if (entry.playerIndex !== playerIndex || entry.completedVisit) {
			continue;
		}
		darts.unshift(dartToPayload(entry));
	}
	return darts;
}

export function recordedDartsInVisit({ bust, physicalDarts }) {
	if (bust) {
		return BUST_VISIT_DARTS;
	}
	const n = Number(physicalDarts);
	if (!Number.isFinite(n) || n < 1) {
		return 1;
	}
	return Math.min(3, Math.floor(n));
}
