import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
	FRIENDS_ACCEPT_URL,
	FRIENDS_INVITE_URL,
	FRIENDS_REJECT_URL,
} from '../../helpers/apiConfig';
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

	const headers = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		Authorization: `Bearer ${accessToken}`,
	};

	const runAction = async (url, body, okLabel) => {
		if (busy) return;
		setBusy(true);
		try {
			const res = await fetch(url, {
				method: 'POST',
				headers,
				body: JSON.stringify(body),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				Alert.alert('Błąd', data.message || 'Nie udało się wykonać akcji.');
				return;
			}
			if (okLabel) {
				Alert.alert('OK', data.message || okLabel);
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
								FRIENDS_ACCEPT_URL,
								{ invitationId: friendship.pendingReceived.id },
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
								FRIENDS_REJECT_URL,
								{ invitationId: friendship.pendingReceived.id },
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
						runAction(FRIENDS_INVITE_URL, { receiverId: userId }, 'Zaproszenie wysłane')
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
