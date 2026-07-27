import {
	applyCricketDart,
	findCricketLegWinnerIndex,
	allSegmentsClosed,
} from '../cricketRules.js';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function emptyHits() {
	return { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, bull: 0 };
}

function closedAllHits() {
	return { 20: 3, 19: 3, 18: 3, 17: 3, 16: 3, 15: 3, bull: 3 };
}

export function testCricketApplyDartScoring() {
	const hitsList = [emptyHits(), emptyHits()];
	// 2 marki na 20, potem T20 → 1 zamyka + 2×20 punktów
	hitsList[0][20] = 2;
	const { hits, pointsScored } = applyCricketDart(hitsList, 0, 20, 3);
	assert(hits[20] === 5, `expected 5 marks got ${hits[20]}`);
	assert(pointsScored === 40, `expected 40 pts got ${pointsScored}`);
}

export function testCricketDeadNumber() {
	const hitsList = [
		{ ...emptyHits(), 20: 3 },
		{ ...emptyHits(), 20: 3 },
	];
	const { hits, pointsScored } = applyCricketDart(hitsList, 0, 20, 1);
	assert(pointsScored === 0, 'dead number scores 0');
	assert(hits[20] === 3, 'no extra mark when dead');
}

export function testCricketLegWinnerRequiresLead() {
	const tied = [
		{ hits: closedAllHits(), points: 40 },
		{ hits: closedAllHits(), points: 40 },
	];
	assert(findCricketLegWinnerIndex(tied) === null, 'tie continues');

	const lead = [
		{ hits: closedAllHits(), points: 41 },
		{ hits: closedAllHits(), points: 40 },
	];
	assert(findCricketLegWinnerIndex(lead) === 0, 'leader wins');

	const openOpponent = [
		{ hits: closedAllHits(), points: 20 },
		{ hits: emptyHits(), points: 0 },
	];
	assert(findCricketLegWinnerIndex(openOpponent) === 0, 'closed + lead vs open');

	assert(allSegmentsClosed(closedAllHits()), 'all closed helper');
}

export function runCricketTests() {
	testCricketApplyDartScoring();
	testCricketDeadNumber();
	testCricketLegWinnerRequiresLead();
}
