import { getSeasonStandingsUrl } from './apiConfig';

/**
 * Fetch one page of leagues / seasons / tournaments catalog.
 * @param {(page: number) => string} buildUrl
 * @param {string} accessToken
 * @param {number} [page]
 * @returns {Promise<{ items: Array, hasMore: boolean, error: string|null }>}
 */
export async function fetchCompetitionPage(buildUrl, accessToken, page = 1) {
	if (!accessToken || typeof buildUrl !== 'function') {
		return { items: [], hasMore: false, error: 'Brak autoryzacji.' };
	}

	try {
		const res = await fetch(buildUrl(page), {
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!res.ok) {
			return {
				items: [],
				hasMore: false,
				error: res.status === 401 ? 'Sesja wygasła. Zaloguj się ponownie.' : 'Nie udało się pobrać listy.',
			};
		}

		const data = await res.json();
		return {
			items: Array.isArray(data?.items) ? data.items : [],
			hasMore: Boolean(data?.has_more),
			error: null,
		};
	} catch {
		return { items: [], hasMore: false, error: 'Błąd połączenia.' };
	}
}

/**
 * Fetch competition detail (league / season / tournament show).
 * @param {string} url
 * @param {string} accessToken
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function fetchCompetitionDetail(url, accessToken) {
	if (!accessToken || !url) {
		return { data: null, error: 'Brak autoryzacji.' };
	}

	try {
		const res = await fetch(url, {
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (res.status === 404) {
			return { data: null, error: 'Nie znaleziono.' };
		}
		if (!res.ok) {
			return {
				data: null,
				error: res.status === 401 ? 'Sesja wygasła. Zaloguj się ponownie.' : 'Nie udało się pobrać szczegółów.',
			};
		}

		return { data: await res.json(), error: null };
	} catch {
		return { data: null, error: 'Błąd połączenia.' };
	}
}

/**
 * Fetch one page of season standings.
 * @returns {Promise<{ items: Array, hasMore: boolean, error: string|null }>}
 */
export async function fetchSeasonStandingsPage(seasonId, accessToken, page = 1) {
	if (!accessToken || !seasonId) {
		return { items: [], hasMore: false, error: 'Brak autoryzacji.' };
	}

	try {
		const res = await fetch(getSeasonStandingsUrl(seasonId, page), {
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!res.ok) {
			return {
				items: [],
				hasMore: false,
				error: res.status === 401 ? 'Sesja wygasła. Zaloguj się ponownie.' : 'Nie udało się pobrać tabeli.',
			};
		}

		const data = await res.json();
		return {
			items: Array.isArray(data?.items) ? data.items : [],
			hasMore: Boolean(data?.has_more),
			error: null,
		};
	} catch {
		return { items: [], hasMore: false, error: 'Błąd połączenia.' };
	}
}
