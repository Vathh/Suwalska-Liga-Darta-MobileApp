import {
	applyCricket56Visit,
	cricket56ClampPoints,
	CRICKET56_KIND_WIN,
	CRICKET56_KIND_TIE_RESET,
	CRICKET56_KIND_CONTINUE,
	resolveCricket56AfterCompletedVisit,
} from '../cricket56Rules.js';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

export function testCricket56Scoring() {
	assert(applyCricket56Visit(0, 9, 0) === 9, 'three triples on 15');
	assert(cricket56ClampPoints(9, 6) === 6, 'bull max 6');
	assert(applyCricket56Visit(54, 6, 6) === 60, 'perfect 60');
}

export function testCricket56Resolve() {
	const win = resolveCricket56AfterCompletedVisit(
		[{ score: 40 }, { score: 55 }],
		6,
		{ 0: true, 1: true },
	);
	assert(win.kind === CRICKET56_KIND_WIN && win.winnerIndex === 1, 'highest wins');

	const tie = resolveCricket56AfterCompletedVisit(
		[{ score: 40 }, { score: 40 }],
		6,
		{ 0: true, 1: true },
	);
	assert(tie.kind === CRICKET56_KIND_TIE_RESET, 'tie resets');

	const wait = resolveCricket56AfterCompletedVisit(
		[{ score: 9 }, { score: 0 }],
		0,
		{ 0: true },
	);
	assert(wait.kind === CRICKET56_KIND_CONTINUE, 'wait for others');
}

export function runCricket56Tests() {
	testCricket56Scoring();
	testCricket56Resolve();
}
