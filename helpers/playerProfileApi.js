import { getPlayerGamesUrl, getPlayerProfileUrl } from './apiConfig';

function authHeaders(accessToken, withJson = false) {
	const headers = {
		Accept: 'application/json',
		Authorization: `Bearer ${accessToken}`,
	};
	if (withJson) {
		headers['Content-Type'] = 'application/json';
	}
	return headers;
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

/**
 * @returns {Promise<{ ok: true, data: object } | { ok: false, status: number, data: object }>}
 */
export async function updatePlayerProfile(playerId, accessToken, { description }) {
	if (!playerId || !accessToken) {
		return { ok: false, status: 0, data: { message: 'Brak danych logowania.' } };
	}

	try {
		const res = await fetch(getPlayerProfileUrl(playerId), {
			method: 'PUT',
			headers: authHeaders(accessToken, true),
			body: JSON.stringify({ description }),
		});
		const data = await res.json().catch(() => ({}));
		return { ok: res.ok, status: res.status, data };
	} catch {
		return { ok: false, status: 0, data: { message: 'Błąd połączenia.' } };
	}
}
