import { Alert } from 'react-native';

export function notifyFfaGameAborted(navigation) {
	Alert.alert('Gra skasowana', 'Host unieważnił tę grę.', [
		{
			text: 'OK',
			onPress: () => {
				if (navigation?.canGoBack?.()) {
					navigation.goBack();
				}
			},
		},
	]);
}
