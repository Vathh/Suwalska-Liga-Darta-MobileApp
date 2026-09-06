/**
 * Ile lotek zapisujemy w wizycie X01 (średnia 3-dartowa).
 *
 * Bust / overthrow zużywa całe podejście (zawsze 3), nawet gdy fizycznie
 * rzucono 1–2 lotki. Checkout na 1. lub 2. lotce — tyle, ile rzucono.
 */
export const BUST_VISIT_DARTS = 3;

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
