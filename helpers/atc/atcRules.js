export const ATC_TARGET_COUNT = 21;
export const ATC_LAST_TARGET_INDEX = 20;
export const ATC_FINISHED_INDEX = 21;

export const ATC_KIND_CONTINUE = 'continue';
export const ATC_KIND_WIN = 'win';

export function atcTargets() {
	const out = [];
	for (let n = 1; n <= 20; n += 1) out.push(n);
	out.push('bull');
	return out;
}

export function atcTargetAt(index) {
	const targets = atcTargets();
	return targets[index] ?? 'bull';
}

export function atcTargetLabel(index) {
	if (index >= ATC_TARGET_COUNT) return '✓';
	const target = atcTargetAt(index);
	return target === 'bull' ? 'Bull' : String(target);
}

export function atcRemaining(targetIndex) {
	return Math.max(0, ATC_TARGET_COUNT - Math.max(0, targetIndex));
}

export function atcMaxHits(targetIndex) {
	return Math.min(3, atcRemaining(targetIndex));
}

export function clampAtcHits(hits, targetIndex) {
	const n = Math.max(0, Math.min(3, Number(hits) || 0));
	return Math.min(n, atcMaxHits(targetIndex));
}

export function applyAtcVisit(targetIndexBefore, hits) {
	const before = Math.max(0, Math.min(ATC_TARGET_COUNT, Number(targetIndexBefore) || 0));
	if (before >= ATC_TARGET_COUNT) {
		return { targetIndex: ATC_TARGET_COUNT, finished: true };
	}
	const safeHits = clampAtcHits(hits, before);
	const next = before + safeHits;
	const finished = next >= ATC_TARGET_COUNT;
	return {
		targetIndex: finished ? ATC_TARGET_COUNT : next,
		finished,
	};
}

export function emptyAtcBoard() {
	return { targetIndex: 0, finished: false };
}

export function isAtcGameType(gameType) {
	const raw = String(gameType ?? '').toLowerCase();
	return raw === 'atc' || raw === 'around_the_clock' || raw === 'clock';
}
