import { useEffect } from 'react';
import { Alert } from 'react-native';
import { leaveQuickGameLobby } from '../helpers/quickGameLobbyApi';

function findTabNavigator(navigation) {
	let nav = navigation?.getParent?.('UserMainTabs') ?? navigation?.getParent?.();
	while (nav) {
		const type = nav.getState?.()?.type;
		if (type === 'tab') return nav;
		nav = nav.getParent?.();
	}
	return null;
}

/**
 * Gdy użytkownik jest w aktywnym lobby quick game i klika dolny tab —
 * zapytaj o potwierdzenie wyjścia, wywołaj leave API, potem przejdź do tabu.
 */
export function useLeaveLobbyOnTabPress({
	navigation,
	lobbyId,
	accessToken,
	onLeftLobby,
}) {
	useEffect(() => {
		if (!lobbyId) return undefined;

		const tabNav = findTabNavigator(navigation);
		if (!tabNav?.addListener) return undefined;

		const unsubscribe = tabNav.addListener('tabPress', (e) => {
			const state = tabNav.getState?.();
			const targetRoute = state?.routes?.find((r) => r.key === e.target);
			const targetName = targetRoute?.name;
			if (!targetName) return;

			e.preventDefault();

			Alert.alert(
				'Opuścić lobby?',
				'Przejście do innej sekcji opuści lobby. Czy na pewno chcesz wyjść?',
				[
					{ text: 'Anuluj', style: 'cancel' },
					{
						text: 'Opuść lobby',
						style: 'destructive',
						onPress: async () => {
							try {
								if (accessToken) {
									await leaveQuickGameLobby(lobbyId, accessToken);
								}
							} catch (err) {
								console.warn('leave lobby on tabPress', err);
							}
							onLeftLobby?.();
							tabNav.navigate(targetName);
						},
					},
				],
			);
		});

		return unsubscribe;
	}, [navigation, lobbyId, accessToken, onLeftLobby]);
}
