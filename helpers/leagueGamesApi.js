import {
	LEAGUE_GAMES_INVITATIONS_URL,
	LEAGUE_GAMES_MINE_URL,
	getLeagueGameAcceptUrl,
	getLeagueGameCancelUrl,
	getLeagueGameOpenLobbyUrl,
	getLeagueGameRejectUrl,
	getLeagueGameStartUrl,
	getLeagueGameUrl,
} from './apiConfig';
import { apiRequest } from './apiClient';

export async function fetchMyLeagueGames(accessToken) {
	return apiRequest(LEAGUE_GAMES_MINE_URL, { accessToken });
}

export async function fetchLeagueGameInvitations(accessToken) {
	return apiRequest(LEAGUE_GAMES_INVITATIONS_URL, { accessToken });
}

export async function fetchLeagueGame(gameId, accessToken) {
	return apiRequest(getLeagueGameUrl(gameId), { accessToken });
}

export async function openLeagueGameLobby(gameId, accessToken) {
	return apiRequest(getLeagueGameOpenLobbyUrl(gameId), {
		method: 'POST',
		accessToken,
		json: true,
		body: {},
	});
}

export async function acceptLeagueGameLobby(gameId, accessToken) {
	return apiRequest(getLeagueGameAcceptUrl(gameId), {
		method: 'POST',
		accessToken,
		json: true,
		body: {},
	});
}

export async function rejectLeagueGameLobby(gameId, accessToken) {
	return apiRequest(getLeagueGameRejectUrl(gameId), {
		method: 'POST',
		accessToken,
		json: true,
		body: {},
	});
}

export async function cancelLeagueGameLobby(gameId, accessToken) {
	return apiRequest(getLeagueGameCancelUrl(gameId), {
		method: 'POST',
		accessToken,
		json: true,
		body: {},
	});
}

export async function startLeagueGameScoring(gameId, accessToken) {
	return apiRequest(getLeagueGameStartUrl(gameId), {
		method: 'POST',
		accessToken,
		json: true,
		body: {},
	});
}
