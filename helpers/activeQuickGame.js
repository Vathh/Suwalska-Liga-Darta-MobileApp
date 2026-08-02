import { fetchActiveFfaGame } from './quickGameFfaApi';

/**
 * Aktywny mecz tylko z API — bez fallbacku z pamięci lokalnej
 * (unika „wróć do meczu” po left).
 */
export async function resolveActiveFfaGame(accessToken) {
	if (!accessToken) {
		return null;
	}

	try {
		const game = await fetchActiveFfaGame(accessToken);
		if (game?.lobbyId) {
			return game;
		}
		return null;
	} catch {
		return null;
	}
}

export function buildGameScoringParamsFromActiveGame(game) {
	if (!game?.lobbyId) return null;

	const players = (game.players ?? []).map((p) => ({
		id: p.id,
		name: p.name,
	}));

	return {
		quickGame: {
			players,
			lobbyId: game.lobbyId,
			matchFormat: game.matchFormat,
			gameType: game.gameType ?? 'x01',
			scoringMode: game.scoringMode ?? 'each_own',
			isHost: !!game.isHost,
			myPlayerIndex: game.myPlayerIndex ?? 0,
		},
	};
}
