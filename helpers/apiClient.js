/**
 * Wspólne helpery fetch dla helperów *Api.js zwracających `{ ok, status, data }`.
 * Nie dotyczy plików throw-style (quickGameFfaApi, gameScoringApi) — te mają
 * inny kontrakt błędów i nie są migrowane w tym przejściu.
 */

export function authHeaders(accessToken, { json = false } = {}) {
	const headers = {
		Accept: 'application/json',
	};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}
	if (json) {
		headers['Content-Type'] = 'application/json';
	}
	return headers;
}

export async function parseJsonSafe(res) {
	return res.json().catch(() => ({}));
}

/**
 * @returns {Promise<{ ok: boolean, status: number, data: object }>}
 */
export async function apiRequest(url, { method = 'GET', accessToken, body, json = false } = {}) {
	const res = await fetch(url, {
		method,
		headers: authHeaders(accessToken, { json }),
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}
