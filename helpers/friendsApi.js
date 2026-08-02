import {
	FRIENDS_API_URL,
	FRIENDS_INVITE_URL,
	FRIENDS_INVITATIONS_SENT_URL,
	FRIENDS_REMOVE_URL,
	USERS_SEARCH_URL,
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

export async function fetchFriends(accessToken) {
	const res = await fetch(FRIENDS_API_URL, {
		headers: authHeaders(accessToken),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function fetchSentFriendInvitations(accessToken) {
	const res = await fetch(FRIENDS_INVITATIONS_SENT_URL, {
		headers: authHeaders(accessToken),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function searchUsers(query, accessToken) {
	const url = `${USERS_SEARCH_URL}?q=${encodeURIComponent(query)}`;
	const res = await fetch(url, {
		headers: authHeaders(accessToken),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function sendFriendInvite(receiverId, accessToken) {
	const res = await fetch(FRIENDS_INVITE_URL, {
		method: 'POST',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify({ receiverId }),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}

export async function removeFriend(friendId, accessToken) {
	const res = await fetch(FRIENDS_REMOVE_URL, {
		method: 'DELETE',
		headers: authHeaders(accessToken, true),
		body: JSON.stringify({ friendId }),
	});
	const data = await parseJsonSafe(res);
	return { ok: res.ok, status: res.status, data };
}
