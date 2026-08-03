import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { sendFriendInvite } from '../../helpers/friendsApi';
import { actOnFriendInvitation } from '../../helpers/invitationsApi';
import { colors } from '../../theme/colors';

const ProfileFriendshipActions = ({
	friendship,
	userId,
	accessToken,
	onChanged,
}) => {
	const [busy, setBusy] = useState(false);

	if (!friendship || friendship.isSelf) {
		return null;
	}

	const runAction = async (request, okLabel) => {
		if (busy) return;
		setBusy(true);
		try {
			const { ok, data } = await request();
			if (!ok) {
				Alert.alert('Błąd', data?.message || 'Nie udało się wykonać akcji.');
				return;
			}
			if (okLabel) {
				Alert.alert('OK', data?.message || okLabel);
			}
			onChanged?.();
		} catch {
			Alert.alert('Błąd', 'Błąd połączenia.');
		} finally {
			setBusy(false);
		}
	};

	if (friendship.isFriend) {
		return (
			<View style={styles.wrap}>
				<Text style={styles.status}>Znajomy</Text>
			</View>
		);
	}

	if (friendship.pendingSent) {
		return (
			<View style={styles.wrap}>
				<Text style={styles.status}>Zaproszenie wysłane</Text>
			</View>
		);
	}

	if (friendship.pendingReceived?.id) {
		return (
			<View style={styles.wrap}>
				<Text style={styles.hint}>Zaproszenie od tego gracza</Text>
				<View style={styles.row}>
					<Pressable
						style={[styles.button, busy && styles.disabled]}
						disabled={busy}
						onPress={() =>
							runAction(
								() => actOnFriendInvitation(friendship.pendingReceived.id, 'accept', accessToken),
								'Zaproszenie zaakceptowane',
							)
						}
					>
						{busy ? (
							<ActivityIndicator color={colors.onAccent} size="small" />
						) : (
							<Text style={styles.buttonText}>Akceptuj</Text>
						)}
					</Pressable>
					<Pressable
						style={[styles.buttonSecondary, busy && styles.disabled]}
						disabled={busy}
						onPress={() =>
							runAction(
								() => actOnFriendInvitation(friendship.pendingReceived.id, 'reject', accessToken),
								'Zaproszenie odrzucone',
							)
						}
					>
						<Text style={styles.buttonSecondaryText}>Odrzuć</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	if (friendship.canInvite && userId) {
		return (
			<View style={styles.wrap}>
				<Pressable
					style={[styles.button, busy && styles.disabled]}
					disabled={busy}
					onPress={() =>
						runAction(() => sendFriendInvite(userId, accessToken), 'Zaproszenie wysłane')
					}
				>
					{busy ? (
						<ActivityIndicator color={colors.onAccent} size="small" />
					) : (
						<Text style={styles.buttonText}>Dodaj do znajomych</Text>
					)}
				</Pressable>
			</View>
		);
	}

	return null;
};

const styles = StyleSheet.create({
	wrap: {
		marginBottom: 16,
	},
	status: {
		color: colors.accent,
		fontWeight: '700',
		fontSize: 15,
	},
	hint: {
		color: colors.accent,
		fontSize: 13,
		marginBottom: 8,
	},
	row: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	button: {
		backgroundColor: colors.accent,
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		alignItems: 'center',
		minWidth: 120,
	},
	buttonText: {
		color: colors.onAccent,
		fontWeight: '600',
	},
	buttonSecondary: {
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: colors.accent,
	},
	buttonSecondaryText: {
		color: colors.accent,
		fontWeight: '600',
	},
	disabled: {
		opacity: 0.6,
	},
});

export default ProfileFriendshipActions;
