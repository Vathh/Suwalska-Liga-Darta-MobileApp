import { getPlayerGamesUrl, getPlayerProfileUrl } from './apiConfig';

function authHeaders(accessToken) {
	return {
		Accept: 'application/json',
		Authorization: `Bearer ${accessToken}`,
	};
}

/**
 * @returns {Promise<{ ok: true, data: object } | { ok: false, status: number, message: string }>}
 */
export async function fetchPlayerProfile(playerId, accessToken) {
	if (!playerId || !accessToken) {
		return { ok: false, status: 0, message: 'Brak danych logowania.' };
	}

	try {
		const res = await fetch(getPlayerProfileUrl(playerId), {
			headers: authHeaders(accessToken),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			return {
				ok: false,
				status: res.status,
				message: data.message || 'Nie udało się wczytać profilu.',
			};
		}
		return { ok: true, data };
	} catch {
		return { ok: false, status: 0, message: 'Błąd połączenia.' };
	}
}

/**
 * @returns {Promise<{ ok: true, data: { items: array, has_more: boolean } } | { ok: false, message: string }>}
 */
export async function fetchPlayerGames(playerId, accessToken, page = 1) {
	if (!playerId || !accessToken) {
		return { ok: false, message: 'Brak danych logowania.' };
	}

	try {
		const res = await fetch(getPlayerGamesUrl(playerId, page), {
			headers: authHeaders(accessToken),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			return {
				ok: false,
				message: data.message || 'Nie udało się wczytać historii.',
			};
		}
		return { ok: true, data };
	} catch {
		return { ok: false, message: 'Błąd połączenia.' };
	}
}
