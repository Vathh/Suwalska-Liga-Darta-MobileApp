import { createAchievementHandlers } from '../achievementHandlers.js';
import { ADD_ACHIEVEMENT } from '../../reducers/achievementActions.js';

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function makeHandlers(overrides = {}) {
	const dispatched = [];
	const handlers = createAchievementHandlers({
		achievementsDispatch: (action) => dispatched.push(action),
		activeGame: { tournamentId: 42 },
		currentPlayer: { playerId: 7 },
		currentResult: null,
		...overrides,
	});
	return { ...handlers, dispatched };
}

function testMaxAchievementOn180() {
	const { handleMaxAndOneSeventy, dispatched } = makeHandlers();
	handleMaxAndOneSeventy(undefined, 180);
	assert(dispatched.length === 1, 'one achievement dispatched for 180');
	assert(dispatched[0].type === ADD_ACHIEVEMENT, 'dispatch is ADD_ACHIEVEMENT');
	assert(dispatched[0].payload.type === 'max', 'type is max');
	assert(dispatched[0].payload.playerId === 7, 'uses current player id');
	assert(dispatched[0].payload.tournamentId === 42, 'carries tournamentId');
}

function testOneSeventyRangeInclusiveExclusive() {
	const { handleMaxAndOneSeventy, dispatched } = makeHandlers();
	handleMaxAndOneSeventy(undefined, 170);
	handleMaxAndOneSeventy(undefined, 179);
	assert(dispatched.length === 2, 'both 170 and 179 count as one_seventy');
	assert(
		dispatched.every((a) => a.payload.type === 'one_seventy'),
		'both dispatched as one_seventy',
	);
}

function testBelowThresholdSkipsMaxAndOneSeventy() {
	const { handleMaxAndOneSeventy, dispatched } = makeHandlers();
	handleMaxAndOneSeventy(undefined, 169);
	assert(dispatched.length === 0, 'no achievement below 170');
}

function testMaxUsesCurrentResultWhenVisitScoreOmitted() {
	const { handleMaxAndOneSeventy, dispatched } = makeHandlers({ currentResult: 180 });
	handleMaxAndOneSeventy();
	assert(dispatched.length === 1 && dispatched[0].payload.type === 'max', 'falls back to currentResult');
}

function testMaxUsesExplicitPlayerOverCurrentPlayer() {
	const { handleMaxAndOneSeventy, dispatched } = makeHandlers();
	handleMaxAndOneSeventy({ playerId: 99 }, 180);
	assert(dispatched[0].payload.playerId === 99, 'explicit player wins over currentPlayer');
}

function testMaxSkipsWhenNoPlayer() {
	const { handleMaxAndOneSeventy, dispatched } = makeHandlers({ currentPlayer: null });
	handleMaxAndOneSeventy(null, 180);
	assert(dispatched.length === 0, 'no player means no achievement');
}

function testHfAtThreshold() {
	const { handleHf, dispatched } = makeHandlers();
	handleHf(100);
	assert(dispatched.length === 1 && dispatched[0].payload.type === 'hf', 'hf dispatched at 100');
}

function testHfBelowThresholdSkipped() {
	const { handleHf, dispatched } = makeHandlers();
	handleHf(99);
	assert(dispatched.length === 0, 'no hf below 100');
}

function testHfUsesExplicitPlayer() {
	const { handleHf, dispatched } = makeHandlers();
	handleHf(150, { playerId: 55 });
	assert(dispatched[0].payload.playerId === 55, 'hf uses explicit player');
}

function testQfBelowTwenty() {
	const { handleQf, dispatched } = makeHandlers();
	handleQf({ playerId: 3 }, 19);
	assert(dispatched.length === 1 && dispatched[0].payload.type === 'qf', 'qf dispatched under 20');
	assert(dispatched[0].payload.playerId === 3, 'qf uses passed player');
}

function testQfAtTwentyOrAboveSkipped() {
	const { handleQf, dispatched } = makeHandlers();
	handleQf({ playerId: 3 }, 20);
	assert(dispatched.length === 0, 'no qf at/above 20');
}

export function runAchievementHandlersTests() {
	testMaxAchievementOn180();
	testOneSeventyRangeInclusiveExclusive();
	testBelowThresholdSkipsMaxAndOneSeventy();
	testMaxUsesCurrentResultWhenVisitScoreOmitted();
	testMaxUsesExplicitPlayerOverCurrentPlayer();
	testMaxSkipsWhenNoPlayer();
	testHfAtThreshold();
	testHfBelowThresholdSkipped();
	testHfUsesExplicitPlayer();
	testQfBelowTwenty();
	testQfAtTwentyOrAboveSkipped();
}
