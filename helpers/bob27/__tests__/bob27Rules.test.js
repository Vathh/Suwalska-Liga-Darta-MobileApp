import {
	applyBob27Visit,
	bob27PerfectScore,
	resolveBob27AfterCompletedVisit,
	shouldEliminateBob27,
	BOB27_KIND_WIN,
	BOB27_KIND_BUST,
	BOB27_KIND_TIE_RESET,
	BOB27_KIND_CONTINUE,
	BOB27_LAST_TARGET_INDEX,
} from '../bob27Rules.js';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

export function testBob27PerfectScore() {
	assert(bob27PerfectScore() === 1437, 'perfect score 1437');
}

export function testBob27VisitMath() {
	assert(applyBob27Visit(27, 0, 0) === 25, 'miss D1');
	assert(applyBob27Visit(27, 2, 0) === 31, 'two D1');
	assert(applyBob27Visit(27, 3, 20) === 177, 'three inner bulls');
	assert(shouldEliminateBob27(0, 'hard'), 'hard at 0');
	assert(!shouldEliminateBob27(-4, 'easy'), 'easy stays in');
}

export function testBob27LastSurvivor() {
	const result = resolveBob27AfterCompletedVisit(
		[
			{ score: -2, eliminated: true },
			{ score: 40, eliminated: false },
		],
		'hard',
		3,
		{ 1: true },
	);
	assert(result.kind === BOB27_KIND_WIN && result.winnerIndex === 1, 'last survivor');
}

export function testBob27BoardCompleteAndTie() {
	const win = resolveBob27AfterCompletedVisit(
		[
			{ score: 80, eliminated: false },
			{ score: 40, eliminated: false },
		],
		'easy',
		BOB27_LAST_TARGET_INDEX,
		{ 0: true, 1: true },
	);
	assert(win.kind === BOB27_KIND_WIN && win.winnerIndex === 0, 'highest wins');

	const tie = resolveBob27AfterCompletedVisit(
		[
			{ score: 40, eliminated: false },
			{ score: 40, eliminated: false },
		],
		'easy',
		BOB27_LAST_TARGET_INDEX,
		{ 0: true, 1: true },
	);
	assert(tie.kind === BOB27_KIND_TIE_RESET, 'tie resets');

	const mid = resolveBob27AfterCompletedVisit(
		[
			{ score: 31, eliminated: false },
			{ score: 27, eliminated: false },
		],
		'easy',
		0,
		{ 0: true },
	);
	assert(mid.kind === BOB27_KIND_CONTINUE, 'wait for others');

	const bust = resolveBob27AfterCompletedVisit(
		[{ score: -2, eliminated: true }],
		'hard',
		0,
		{ 0: true },
	);
	assert(bust.kind === BOB27_KIND_BUST, 'solo bust');
}

export function runBob27Tests() {
	testBob27PerfectScore();
	testBob27VisitMath();
	testBob27LastSurvivor();
	testBob27BoardCompleteAndTie();
}
