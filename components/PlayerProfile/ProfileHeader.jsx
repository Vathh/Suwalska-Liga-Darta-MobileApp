import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const ProfileHeader = ({ name, registeredAt }) => {
	return (
		<View style={styles.card}>
			<Text style={styles.name}>{name || 'Gracz'}</Text>
			{registeredAt ? (
				<Text style={styles.meta}>Zarejestrowany od {registeredAt}</Text>
			) : (
				<Text style={styles.metaMuted}>Gracz gość</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.bgElevated,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 16,
		marginBottom: 16,
	},
	name: {
		fontSize: 24,
		fontWeight: '700',
		color: colors.text,
	},
	meta: {
		marginTop: 8,
		fontSize: 14,
		color: colors.textSecondary,
	},
	metaMuted: {
		marginTop: 8,
		fontSize: 14,
		color: colors.textMuted,
	},
});

export default ProfileHeader;
