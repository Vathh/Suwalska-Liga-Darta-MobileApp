import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const TrainingHub = ({ navigation }) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Trening</Text>
			<Text style={styles.hint}>
				Graj lokalnie bez konta albo przeglądaj zapisane wyniki poprzednich
				treningów.
			</Text>
			<Pressable
				style={styles.button}
				onPress={() => navigation.navigate('TrainingMatchSetup')}
			>
				<Text style={styles.buttonText}>Zagraj</Text>
			</Pressable>
			<Pressable
				style={styles.buttonSecondary}
				onPress={() => navigation.navigate('TrainingHistory')}
			>
				<Text style={styles.buttonSecondaryText}>Historia treningów</Text>
			</Pressable>
			<Pressable
				style={styles.backBtn}
				onPress={() => {
					if (navigation.canGoBack()) navigation.goBack();
				}}
			>
				<Text style={styles.backBtnText}>Wróć</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg,
		paddingHorizontal: 24,
		paddingTop: 48,
		alignItems: 'center',
	},
	title: {
		fontSize: 24,
		color: colors.accent,
		fontWeight: '600',
		marginBottom: 12,
		textAlign: 'center',
	},
	hint: {
		fontSize: 14,
		color: colors.textMuted,
		textAlign: 'center',
		marginBottom: 36,
		lineHeight: 20,
		paddingHorizontal: 8,
	},
	button: {
		width: '100%',
		backgroundColor: colors.accent,
		borderRadius: 8,
		paddingVertical: 16,
		alignItems: 'center',
		marginBottom: 14,
	},
	buttonText: {
		color: colors.onAccent,
		fontSize: 17,
		fontWeight: '700',
	},
	buttonSecondary: {
		width: '100%',
		borderWidth: 2,
		borderColor: colors.accent,
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: 'center',
		marginBottom: 14,
	},
	buttonSecondaryText: {
		color: colors.accent,
		fontSize: 17,
		fontWeight: '700',
	},
	backBtn: {
		marginTop: 20,
		paddingVertical: 10,
	},
	backBtnText: {
		color: colors.textMuted,
		fontSize: 15,
	},
});

export default TrainingHub;
