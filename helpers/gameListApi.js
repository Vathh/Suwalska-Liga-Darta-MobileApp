import { ACTIVE_GAMES_API_URL } from './apiConfig';
import { apiRequest } from './apiClient';

/**
 * @returns {Promise<{ ok: true, status: number, data: array } | { ok: false, status: number }>}
 */
export async function fetchActiveGames(tournamentId, accessToken) {
	const url = `${ACTIVE_GAMES_API_URL}?tournamentId=${tournamentId}`;
	const { ok, status, data } = await apiRequest(url, { accessToken });
	if (!ok) {
		return { ok: false, status };
	}
	return { ok: true, status, data: Array.isArray(data) ? data : [] };
}
