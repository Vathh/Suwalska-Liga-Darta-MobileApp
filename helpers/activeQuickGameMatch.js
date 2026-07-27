import { fetchActiveFfaMatch } from './quickGameFfaApi';

/**
 * Aktywny mecz tylko z API — bez fallbacku z pamięci lokalnej
 * (unika „wróć do meczu” po left).
 */
export async function resolveActiveFfaMatch(accessToken) {
	if (!accessToken) {
		return null;
	}

	try {
		const match = await fetchActiveFfaMatch(accessToken);
		if (match?.lobbyId) {
			return match;
		}
		return null;
	} catch {
		return null;
	}
}

export function buildGameScoringParamsFromActiveMatch(match) {
	if (!match?.lobbyId) return null;

	const players = (match.players ?? []).map((p) => ({
		id: p.id,
		name: p.name,
	}));

	return {
		quickGame: {
			players,
			lobbyId: match.lobbyId,
			matchFormat: match.matchFormat,
			gameType: match.gameType ?? 'x01',
			scoringMode: match.scoringMode ?? 'each_own',
			isHost: !!match.isHost,
			myPlayerIndex: match.myPlayerIndex ?? 0,
		},
	};
}
