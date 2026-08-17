import {
	applyCatch40Visit,
	catch40PointsForCheckout,
	resolveCatch40AfterVisit,
	CATCH40_KIND_WIN,
	CATCH40_KIND_TIE_RESET,
	CATCH40_KIND_CONTINUE,
} from '../catch40Rules.js';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

export function testCatch40Points() {
	assert(catch40PointsForCheckout(61, 2) === 3, '2 darts = 3');
	assert(catch40PointsForCheckout(61, 3) === 2, '3 darts = 2');
	assert(catch40PointsForCheckout(61, 6) === 1, '6 darts = 1');
	assert(catch40PointsForCheckout(99, 3) === 3, '99 in 3 = 3');
}

export function testCatch40VisitFlow() {
	const afterHit = applyCatch40Visit(
		{
			outNumber: 61,
			remaining: 61,
			dartsUsed: 0,
			catch40Score: 0,
			finished: false,
		},
		{ score: 20, remainingAfter: 41, dartsInVisit: 3, bust: false, checkout: false },
	);
	assert(afterHit.remaining === 41 && afterHit.dartsUsed === 3, 'partial visit');

	const sumVisitMissingDarts = applyCatch40Visit(
		{
			outNumber: 61,
			remaining: 61,
			dartsUsed: 0,
			catch40Score: 0,
			finished: false,
		},
		{ score: 50, remainingAfter: 11, bust: false, checkout: false },
	);
	assert(sumVisitMissingDarts.dartsUsed === 3, 'sum visit without dartsInVisit = 3');

	const oneDart = applyCatch40Visit(
		{
			outNumber: 61,
			remaining: 61,
			dartsUsed: 0,
			catch40Score: 0,
			finished: false,
		},
		{ score: 20, remainingAfter: 41, dartsInVisit: 1, bust: false, checkout: false },
	);
	assert(oneDart.dartsUsed === 1, 'explicit 1 dart visit');

	const checkout = applyCatch40Visit(
		{
			outNumber: 61,
			remaining: 61,
			dartsUsed: 0,
			catch40Score: 0,
			finished: false,
		},
		{ score: 61, remainingAfter: 0, dartsInVisit: 2, bust: false, checkout: true },
	);
	assert(checkout.outNumber === 62 && checkout.catch40Score === 3, 'checkout 2 darts');

	const miss = applyCatch40Visit(
		{
			outNumber: 61,
			remaining: 41,
			dartsUsed: 3,
			catch40Score: 0,
			finished: false,
		},
		{ score: 20, remainingAfter: 21, dartsInVisit: 3, bust: false, checkout: false },
	);
	assert(miss.outNumber === 62 && miss.catch40Score === 0, '6 darts miss');

	const done = applyCatch40Visit(
		{
			outNumber: 100,
			remaining: 40,
			dartsUsed: 0,
			catch40Score: 50,
			finished: false,
		},
		{ score: 40, remainingAfter: 0, dartsInVisit: 2, bust: false, checkout: true },
	);
	assert(done.finished === true && done.catch40Score === 53, '100 finishes');
}

export function testCatch40Resolve() {
	const win = resolveCatch40AfterVisit([
		{ catch40Score: 40, finished: true },
		{ catch40Score: 55, finished: true },
	]);
	assert(win.kind === CATCH40_KIND_WIN && win.winnerIndex === 1, 'highest wins');

	const tie = resolveCatch40AfterVisit([
		{ catch40Score: 40, finished: true },
		{ catch40Score: 40, finished: true },
	]);
	assert(tie.kind === CATCH40_KIND_TIE_RESET, 'tie resets');

	const wait = resolveCatch40AfterVisit([
		{ catch40Score: 40, finished: true },
		{ catch40Score: 12, finished: false },
	]);
	assert(wait.kind === CATCH40_KIND_CONTINUE, 'wait for others');
}

export function runCatch40Tests() {
	testCatch40Points();
	testCatch40VisitFlow();
	testCatch40Resolve();
}
