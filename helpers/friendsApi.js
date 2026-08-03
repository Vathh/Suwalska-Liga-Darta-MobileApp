import {
	FRIENDS_API_URL,
	FRIENDS_INVITE_URL,
	FRIENDS_INVITATIONS_SENT_URL,
	FRIENDS_REMOVE_URL,
	USERS_SEARCH_URL,
} from './apiConfig';
import { apiRequest } from './apiClient';

export async function fetchFriends(accessToken) {
	return apiRequest(FRIENDS_API_URL, { accessToken });
}

export async function fetchSentFriendInvitations(accessToken) {
	return apiRequest(FRIENDS_INVITATIONS_SENT_URL, { accessToken });
}

export async function searchUsers(query, accessToken) {
	const url = `${USERS_SEARCH_URL}?q=${encodeURIComponent(query)}`;
	return apiRequest(url, { accessToken });
}

export async function sendFriendInvite(receiverId, accessToken) {
	return apiRequest(FRIENDS_INVITE_URL, {
		method: 'POST',
		accessToken,
		json: true,
		body: { receiverId },
	});
}

export async function removeFriend(friendId, accessToken) {
	return apiRequest(FRIENDS_REMOVE_URL, {
		method: 'DELETE',
		accessToken,
		json: true,
		body: { friendId },
	});
}
