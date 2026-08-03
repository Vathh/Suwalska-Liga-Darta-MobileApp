import {
	QUICK_GAME_LOBBY_CREATE_API_URL,
	getQuickGameLobbyUrl,
	getQuickGameLobbyLeaveUrl,
	getQuickGameLobbyReadyUrl,
	getQuickGameLobbyStartUrl,
	getQuickGameLobbyInviteUrl,
	getQuickGameLobbyAddGuestUrl,
} from './apiConfig';
import { apiRequest } from './apiClient';

export async function createQuickGameLobby(accessToken) {
	return apiRequest(QUICK_GAME_LOBBY_CREATE_API_URL, {
		method: 'POST',
		accessToken,
		json: true,
		body: {},
	});
}

export async function fetchQuickGameLobby(lobbyId, accessToken) {
	return apiRequest(getQuickGameLobbyUrl(lobbyId), { accessToken });
}

export async function addQuickGameLobbyGuest(lobbyId, accessToken, tempPlayerName) {
	return apiRequest(getQuickGameLobbyAddGuestUrl(lobbyId), {
		method: 'POST',
		accessToken,
		json: true,
		body: { tempPlayerName },
	});
}

export async function inviteToQuickGameLobby(lobbyId, accessToken, playerId) {
	return apiRequest(getQuickGameLobbyInviteUrl(lobbyId), {
		method: 'POST',
		accessToken,
		json: true,
		body: { playerId },
	});
}

export async function leaveQuickGameLobby(lobbyId, accessToken) {
	const { ok, status } = await apiRequest(getQuickGameLobbyLeaveUrl(lobbyId), {
		method: 'POST',
		accessToken,
	});
	return { ok, status };
}

export async function markQuickGameLobbyReady(lobbyId, accessToken) {
	const { ok, status } = await apiRequest(getQuickGameLobbyReadyUrl(lobbyId), {
		method: 'POST',
		accessToken,
	});
	return { ok, status };
}

export async function updateQuickGameLobbySettings(lobbyId, accessToken, updates) {
	const { ok, status, data } = await apiRequest(getQuickGameLobbyUrl(lobbyId), {
		method: 'PATCH',
		accessToken,
		json: true,
		body: updates,
	});
	return { ok, status, data: ok ? data : null };
}

export async function startQuickGameLobby(lobbyId, accessToken, payload) {
	return apiRequest(getQuickGameLobbyStartUrl(lobbyId), {
		method: 'POST',
		accessToken,
		json: true,
		body: payload,
	});
}
