import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import useAuth from './useAuth';
import { navigate } from '../helpers/navigationRef';
import { registerPushToken } from '../helpers/pushNotifications/registerPushToken';

function tabFromNotificationData(data) {
	const tab = data?.tab;
	if (tab === 'friends') {
		return 'friends';
	}
	return 'gra';
}

function openInvitationsFromResponse(response) {
	const data = response?.notification?.request?.content?.data ?? {};
	if (data?.screen !== 'Zaproszenia' && !data?.type) {
		return;
	}
	navigate('MainTabs', {
		screen: 'Zaproszenia',
		params: { tab: tabFromNotificationData(data) },
	});
}

/**
 * Rejestracja tokena po logowaniu + nawigacja po tapnięciu powiadomienia.
 */
export default function usePushNotifications() {
	const { auth } = useAuth();

	useEffect(() => {
		let cancelled = false;

		(async () => {
			const accessToken = auth?.accessToken;
			if (!accessToken || auth?.tournamentId) {
				return;
			}

			await registerPushToken(accessToken);
			if (cancelled) {
				return;
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [auth?.accessToken, auth?.tournamentId]);

	useEffect(() => {
		const sub = Notifications.addNotificationResponseReceivedListener(
			(response) => {
				openInvitationsFromResponse(response);
			},
		);

		Notifications.getLastNotificationResponseAsync().then((response) => {
			if (response) {
				openInvitationsFromResponse(response);
			}
		});

		return () => sub.remove();
	}, []);
}
