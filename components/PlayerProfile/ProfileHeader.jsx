import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const ProfileHeader = ({ name, registeredAt, description, isSelf, onEditPress }) => {
	return (
		<View style={styles.card}>
			<View style={styles.topRow}>
				<View style={styles.titleBlock}>
					<Text style={styles.name}>{name || 'Gracz'}</Text>
					{registeredAt ? (
						<Text style={styles.meta}>Zarejestrowany od {registeredAt}</Text>
					) : (
						<Text style={styles.metaMuted}>Gracz gość</Text>
					)}
				</View>
				{isSelf ? (
					<Pressable style={styles.editBtn} onPress={onEditPress}>
						<Text style={styles.editBtnText}>Edytuj</Text>
					</Pressable>
				) : null}
			</View>

			{description ? (
				<View style={styles.descriptionBlock}>
					<Text style={styles.descriptionLabel}>Opis</Text>
					<Text style={styles.description}>{description}</Text>
				</View>
			) : isSelf ? (
				<View style={styles.descriptionBlock}>
					<Text style={styles.metaMuted}>
						Nie masz jeszcze opisu. Dodaj go w edycji profilu.
					</Text>
				</View>
			) : null}
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
	topRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 12,
	},
	titleBlock: {
		flex: 1,
		minWidth: 0,
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
	editBtn: {
		backgroundColor: colors.accent,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	editBtnText: {
		color: colors.onAccent,
		fontWeight: '600',
		fontSize: 14,
	},
	descriptionBlock: {
		marginTop: 14,
		paddingTop: 14,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	descriptionLabel: {
		fontSize: 13,
		fontWeight: '600',
		color: colors.accent,
		marginBottom: 6,
	},
	description: {
		fontSize: 15,
		color: colors.textSecondary,
		lineHeight: 22,
	},
});

export default ProfileHeader;
