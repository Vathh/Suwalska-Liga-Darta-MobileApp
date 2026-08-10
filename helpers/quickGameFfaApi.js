import {
	getQuickGameFfaStateUrl,
	getQuickGameFfaUndoUrl,
	getQuickGameFfaVisitUrl,
	getQuickGameFfaPresenceUrl,
	getQuickGameFfaCricketDartUrl,
	getQuickGameFfaCricketUndoUrl,
	QUICK_GAME_LOBBY_ACTIVE_MATCH_URL,
} from './apiConfig';
import { throwIfScoringResponseNotOk } from './gameScoring/scoringRequestError.js';

export {
	getQuickGameFfaStateUrl,
	getQuickGameFfaVisitUrl,
	getQuickGameFfaUndoUrl,
	getQuickGameFfaPresenceUrl,
	getQuickGameFfaCricketDartUrl,
	getQuickGameFfaCricketUndoUrl,
	QUICK_GAME_LOBBY_ACTIVE_MATCH_URL,
};

async function parseJson(res) {
	const text = await res.text();
	try {
		return { data: JSON.parse(text), text };
	} catch {
		return { data: null, text };
	}
}

export async function fetchFfaScoringState(lobbyId, accessToken) {
	const url = getQuickGameFfaStateUrl(lobbyId);
	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
		},
	});
	const { data, text } = await parseJson(res);
	throwIfScoringResponseNotOk(
		res,
		data,
		text,
		'Nie udało się pobrać stanu meczu',
	);
	return data;
}

export async function recordFfaVisit(lobbyId, accessToken, payload) {
	const res = await fetch(getQuickGameFfaVisitUrl(lobbyId), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(payload),
	});
	const { data, text } = await parseJson(res);
	throwIfScoringResponseNotOk(
		res,
		data,
		text,
		'Nie udało się zapisać wizyty',
	);
	return data;
}

export async function undoFfaVisit(lobbyId, accessToken) {
	const res = await fetch(getQuickGameFfaUndoUrl(lobbyId), {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const { data, text } = await parseJson(res);
	throwIfScoringResponseNotOk(
		res,
		data,
		text,
		'Nie udało się cofnąć wizyty',
	);
	return data;
}

export async function postFfaPresence(lobbyId, accessToken, status) {
	const res = await fetch(getQuickGameFfaPresenceUrl(lobbyId), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify({ status }),
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data?.message || 'Nie udało się zaktualizować obecności');
	}
	return data;
}

export async function recordFfaCricketDart(lobbyId, accessToken, payload) {
	const res = await fetch(getQuickGameFfaCricketDartUrl(lobbyId), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(payload),
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data?.message || 'Nie udało się zapisać rzutu');
	}
	return data;
}

export async function undoFfaCricketDart(lobbyId, accessToken) {
	const res = await fetch(getQuickGameFfaCricketUndoUrl(lobbyId), {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data?.message || 'Nie udało się cofnąć rzutu');
	}
	return data;
}

export async function fetchActiveFfaGame(accessToken) {
	const res = await fetch(QUICK_GAME_LOBBY_ACTIVE_MATCH_URL, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
		},
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data?.message || 'Nie udało się pobrać aktywnego meczu');
	}
	return data?.match ?? null;
}
