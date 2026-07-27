export const DEFAULT_MATCH_FORMAT = {
	startingScore: 501,
	legsToWinSet: 2,
	setsToWinMatch: 1,
	gameType: 'x01',
	outRule: 'double_out',
};

export const STARTING_SCORE_OPTIONS = [
	101, 201, 301, 401, 501, 601, 701, 801, 901, 1001,
];

export const GAME_TYPE_X01 = 'x01';
export const GAME_TYPE_CRICKET = 'cricket';

export function isCricketFormat(format) {
	return String(format?.gameType ?? '').toLowerCase() === GAME_TYPE_CRICKET;
}

export function normalizeMatchFormat(input) {
	const base = { ...DEFAULT_MATCH_FORMAT };
	if (!input || typeof input !== 'object') {
		return base;
	}

	let gameType = String(input.gameType ?? input.game_type ?? base.gameType);
	if (gameType === '501') {
		gameType = GAME_TYPE_X01;
	}

	const isCricket = gameType === GAME_TYPE_CRICKET;

	return {
		startingScore: Number(
			input.startingScore ?? input.starting_score ?? base.startingScore,
		),
		legsToWinSet: Number(
			input.legsToWinSet
				?? input.legs_to_win_set
				?? base.legsToWinSet,
		),
		// Cricket: tylko legi, bez setów.
		setsToWinMatch: isCricket
			? 1
			: Number(
				input.setsToWinMatch ?? input.sets_to_win_match ?? base.setsToWinMatch,
			),
		gameType,
		outRule: String(input.outRule ?? input.out_rule ?? base.outRule),
	};
}

export function isSingleSetFormat(format) {
	return (format?.setsToWinMatch ?? 1) === 1;
}

export function formatMatchLabel(format) {
	const f = normalizeMatchFormat(format);
	if (isCricketFormat(f)) {
		return `Cricket · do ${f.legsToWinSet} legów`;
	}
	if (isSingleSetFormat(f)) {
		return `${f.startingScore} · do ${f.legsToWinSet} legów`;
	}

	return `${f.startingScore} · ${f.setsToWinMatch} sety · ${f.legsToWinSet} legi/set`;
}

export function isMatchWon(playerState, format) {
	const f = normalizeMatchFormat(format);
	if (isSingleSetFormat(f)) {
		return (playerState?.legsWon ?? 0) >= f.legsToWinSet;
	}

	return (playerState?.setsWon ?? 0) >= f.setsToWinMatch;
}

export function findWinnerIndex(playerStates, format) {
	const f = normalizeMatchFormat(format);
	return (playerStates ?? []).findIndex((state) => isMatchWon(state, f));
}
