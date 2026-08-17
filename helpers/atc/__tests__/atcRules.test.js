import {
	applyAtcVisit,
	atcMaxHits,
	atcTargetLabel,
	ATC_FINISHED_INDEX,
} from '../atcRules.js';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

export function testAtcLabels() {
	assert(atcTargetLabel(0) === '1', 'start at 1');
	assert(atcTargetLabel(19) === '20', '20');
	assert(atcTargetLabel(20) === 'Bull', 'bull');
	assert(atcTargetLabel(21) === '✓', 'done');
}

export function testAtcVisitMath() {
	assert(applyAtcVisit(0, 1).targetIndex === 1, 'one hit');
	assert(applyAtcVisit(0, 3).targetIndex === 3, 'three hits');
	assert(applyAtcVisit(0, 0).targetIndex === 0, 'miss stays');
	assert(applyAtcVisit(20, 1).finished === true, 'bull finishes');
	assert(applyAtcVisit(18, 3).targetIndex === ATC_FINISHED_INDEX, '19-20-bull');
	assert(applyAtcVisit(18, 2).targetIndex === 20, 'lands on bull');
	assert(atcMaxHits(20) === 1, 'max 1 on bull');
	assert(atcMaxHits(19) === 2, 'max 2 on 20');
}

export function runAtcTests() {
	testAtcLabels();
	testAtcVisitMath();
}
