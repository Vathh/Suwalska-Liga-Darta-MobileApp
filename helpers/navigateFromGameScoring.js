/**
 * Wyjście z root GameScoring do ekranu w stacku Graj (zalogowany)
 * albo replace na root stacku (gość).
 */
export function navigateFromGameScoring(navigation, screenName, params = {}) {
	const state = navigation.getState?.();
	const routeNames = state?.routeNames ?? [];

	if (routeNames.includes('MainTabs')) {
		navigation.navigate('MainTabs', {
			screen: 'Graj',
			params: {
				screen: screenName,
				params,
			},
		});
		return;
	}

	if (typeof navigation.replace === 'function') {
		navigation.replace(screenName, params);
		return;
	}

	navigation.navigate(screenName, params);
}
