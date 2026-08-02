import { ACTIVE_GAMES_API_URL } from './apiConfig';

/**
 * @returns {Promise<{ ok: true, status: number, data: array } | { ok: false, status: number }>}
 */
export async function fetchActiveGames(tournamentId, accessToken) {
	const url = `${ACTIVE_GAMES_API_URL}?tournamentId=${tournamentId}`;
	const res = await fetch(url, {
		method: 'GET',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) {
		return { ok: false, status: res.status };
	}
	const data = await res.json().catch(() => []);
	return { ok: true, status: res.status, data: Array.isArray(data) ? data : [] };
}
