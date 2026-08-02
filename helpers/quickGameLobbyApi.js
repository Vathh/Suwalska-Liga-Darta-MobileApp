import {
	QUICK_GAME_LOBBY_CREATE_API_URL,
	getQuickGameLobbyUrl,
	getQuickGameLobbyLeaveUrl,
	getQuickGameLobbyReadyUrl,
	getQuickGameLobbyStartUrl,
	getQuickGameLobbyInviteUrl,
	getQuickGameLobbyAddGuestUrl,
} from './apiConfig';

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

async function parseJsonSafe(res) {
	return res.json().catch(() => ({}));
}

export async function createQuickGameLobby(accessToken) {
	const res = await fetch(QUICK_GAME_LOBBY_CREATE_API_URL, {
		method: 'POST',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify({}),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function fetchQuickGameLobby(lobbyId, accessToken) {
	const res = await fetch(getQuickGameLobbyUrl(lobbyId), {
		headers: authHeaders(accessToken),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function addQuickGameLobbyGuest(lobbyId, accessToken, tempPlayerName) {
	const res = await fetch(getQuickGameLobbyAddGuestUrl(lobbyId), {
		method: 'POST',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify({ tempPlayerName }),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function inviteToQuickGameLobby(lobbyId, accessToken, playerId) {
	const res = await fetch(getQuickGameLobbyInviteUrl(lobbyId), {
		method: 'POST',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify({ playerId }),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function leaveQuickGameLobby(lobbyId, accessToken) {
	const res = await fetch(getQuickGameLobbyLeaveUrl(lobbyId), {
		method: 'POST',
		headers: authHeaders(accessToken),
	});
	return { ok: res.ok, status: res.status };
}

export async function markQuickGameLobbyReady(lobbyId, accessToken) {
	const res = await fetch(getQuickGameLobbyReadyUrl(lobbyId), {
		method: 'POST',
		headers: authHeaders(accessToken),
	});
	return { ok: res.ok, status: res.status };
}

export async function updateQuickGameLobbySettings(lobbyId, accessToken, updates) {
	const res = await fetch(getQuickGameLobbyUrl(lobbyId), {
		method: 'PATCH',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify(updates),
	});
	if (!res.ok) {
		return { ok: false, status: res.status, data: null };
	}
	const data = await parseJsonSafe(res);
	return { ok: true, status: res.status, data };
}

export async function startQuickGameLobby(lobbyId, accessToken, payload) {
	const res = await fetch(getQuickGameLobbyStartUrl(lobbyId), {
		method: 'POST',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify(payload),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}
