import {
	FRIENDS_ACCEPT_URL,
	FRIENDS_INVITATIONS_RECEIVED_URL,
	FRIENDS_REJECT_URL,
	QUICK_GAME_LOBBY_INVITATIONS_URL,
	TOURNAMENT_INVITATIONS_RECEIVED_URL,
	getQuickGameLobbyRejectInvitationUrl,
	getQuickGameLobbyUrl,
	getTournamentInvitationAcceptUrl,
	getTournamentInvitationRejectUrl,
	getTournamentInvitationWithdrawUrl,
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

export async function fetchTournamentInvitationsReceived(accessToken) {
	const res = await fetch(TOURNAMENT_INVITATIONS_RECEIVED_URL, {
		headers: authHeaders(accessToken),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function fetchQuickGameLobbyInvitations(accessToken) {
	const res = await fetch(QUICK_GAME_LOBBY_INVITATIONS_URL, {
		headers: authHeaders(accessToken),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function fetchFriendInvitationsReceived(accessToken) {
	const res = await fetch(FRIENDS_INVITATIONS_RECEIVED_URL, {
		headers: authHeaders(accessToken),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

const TOURNAMENT_INVITATION_URL_BY_ACTION = {
	accept: getTournamentInvitationAcceptUrl,
	reject: getTournamentInvitationRejectUrl,
	withdraw: getTournamentInvitationWithdrawUrl,
};

export async function actOnTournamentInvitation(invitationId, action, accessToken) {
	const buildUrl = TOURNAMENT_INVITATION_URL_BY_ACTION[action];
	const res = await fetch(buildUrl(invitationId), {
		method: 'POST',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify({}),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function joinQuickGameLobby(lobbyId, accessToken) {
	const res = await fetch(`${getQuickGameLobbyUrl(lobbyId)}/join`, {
		method: 'POST',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify({}),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function rejectQuickGameLobbyInvitation(invitationId, accessToken) {
	const res = await fetch(getQuickGameLobbyRejectInvitationUrl(invitationId), {
		method: 'POST',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify({}),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function actOnFriendInvitation(invitationId, action, accessToken) {
	const url = action === 'accept' ? FRIENDS_ACCEPT_URL : FRIENDS_REJECT_URL;
	const res = await fetch(url, {
		method: 'POST',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify({ invitationId }),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}
