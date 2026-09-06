/**
 * Próba na double-out: remaining przed lotką to 2–40 parzyste albo 50.
 */

import { isDoubleFinishDart } from '../perDartVisitRules.js';

export function isCheckoutRemaining(remaining) {
	const n = Number(remaining);
	if (n === 50) return true;
	return n >= 2 && n <= 40 && n % 2 === 0;
}

/**
 * @param {Array<{ remainingBefore?: number, label?: string, points?: number, bust?: boolean }>} darts
 * @returns {{ attempts: number, successes: number }}
 */
export function countDoubleOutFromDarts(darts) {
	let attempts = 0;
	let successes = 0;
	for (const dart of darts || []) {
		const remaining = Number(dart.remainingBefore);
		if (!isCheckoutRemaining(remaining)) {
			continue;
		}
		attempts += 1;
		const bust = !!dart.bust;
		const points = Number(dart.points) || 0;
		if (!bust && points === remaining && isDoubleFinishDart(dart.label)) {
			successes += 1;
		}
	}
	return { attempts, successes };
}

export function mergeDoubleStats(a, b) {
	return {
		attempts: (a?.attempts ?? 0) + (b?.attempts ?? 0),
		successes: (a?.successes ?? 0) + (b?.successes ?? 0),
	};
}
