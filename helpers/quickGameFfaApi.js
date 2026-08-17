import {
	getQuickGameFfaStateUrl,
	getQuickGameFfaUndoUrl,
	getQuickGameFfaVisitUrl,
	getQuickGameFfaPresenceUrl,
	getQuickGameFfaCricketDartUrl,
	getQuickGameFfaCricketUndoUrl,
	getQuickGameFfaBob27DartUrl,
	getQuickGameFfaBob27UndoUrl,
	getQuickGameFfaAtcVisitUrl,
	getQuickGameFfaAtcUndoUrl,
	getQuickGameFfaCatch40VisitUrl,
	getQuickGameFfaCatch40UndoUrl,
	getQuickGameFfaCricket56VisitUrl,
	getQuickGameFfaCricket56UndoUrl,
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

export async function recordFfaBob27Dart(lobbyId, accessToken, payload) {
	const res = await fetch(getQuickGameFfaBob27DartUrl(lobbyId), {
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
		throw new Error(data?.message || 'Nie udało się zapisać wizyty');
	}
	return data;
}

export async function undoFfaBob27Dart(lobbyId, accessToken) {
	const res = await fetch(getQuickGameFfaBob27UndoUrl(lobbyId), {
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

export async function recordFfaAtcVisit(lobbyId, accessToken, payload) {
	const res = await fetch(getQuickGameFfaAtcVisitUrl(lobbyId), {
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
		throw new Error(data?.message || 'Nie udało się zapisać wizyty');
	}
	return data;
}

export async function undoFfaAtcVisit(lobbyId, accessToken) {
	const res = await fetch(getQuickGameFfaAtcUndoUrl(lobbyId), {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data?.message || 'Nie udało się cofnąć wizyty');
	}
	return data;
}

export async function recordFfaCatch40Visit(lobbyId, accessToken, payload) {
	const res = await fetch(getQuickGameFfaCatch40VisitUrl(lobbyId), {
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
		throw new Error(data?.message || 'Nie udało się zapisać wizyty');
	}
	return data;
}

export async function undoFfaCatch40Visit(lobbyId, accessToken) {
	const res = await fetch(getQuickGameFfaCatch40UndoUrl(lobbyId), {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data?.message || 'Nie udało się cofnąć wizyty');
	}
	return data;
}

export async function recordFfaCricket56Visit(lobbyId, accessToken, payload) {
	const res = await fetch(getQuickGameFfaCricket56VisitUrl(lobbyId), {
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
		throw new Error(data?.message || 'Nie udało się zapisać wizyty');
	}
	return data;
}

export async function undoFfaCricket56Visit(lobbyId, accessToken) {
	const res = await fetch(getQuickGameFfaCricket56UndoUrl(lobbyId), {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data?.message || 'Nie udało się cofnąć wizyty');
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
