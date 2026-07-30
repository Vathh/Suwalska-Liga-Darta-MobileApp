import React, { useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import { updatePlayerProfile } from '../../helpers/playerProfileApi';
import { colors } from '../../theme/colors';

const MAX_DESCRIPTION = 1000;

const EditPlayerProfileScreen = ({ navigation, route }) => {
	const { auth } = useAuth();
	const playerId = route?.params?.playerId;
	const initialDescription = route?.params?.description ?? '';

	const [description, setDescription] = useState(initialDescription);
	const [errorMsg, setErrorMsg] = useState('');
	const [loading, setLoading] = useState(false);

	const parseErrorMessage = (data) => {
		const firstField = data?.errors ? Object.values(data.errors)?.[0] : null;
		if (Array.isArray(firstField) && firstField[0]) {
			return firstField[0];
		}
		if (typeof data?.message === 'string') {
			return data.message;
		}
		return 'Nie udało się zapisać profilu';
	};

	const handleSubmit = async () => {
		if (loading) return;
		setErrorMsg('');

		if (!playerId || !auth?.accessToken) {
			setErrorMsg('Brak sesji — zaloguj się ponownie');
			return;
		}

		if (description.length > MAX_DESCRIPTION) {
			setErrorMsg(`Opis może mieć maksymalnie ${MAX_DESCRIPTION} znaków`);
			return;
		}

		setLoading(true);

		try {
			const { ok, data } = await updatePlayerProfile(
				playerId,
				auth.accessToken,
				{ description },
			);

			if (!ok) {
				setErrorMsg(parseErrorMessage(data));
				return;
			}

			navigation.goBack();
		} catch {
			setErrorMsg('Nie udało się połączyć z serwerem');
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Edycja profilu</Text>
			<View style={styles.form}>
				{!!errorMsg && <Text style={styles.errorMessage}>{errorMsg}</Text>}
				<Text style={styles.label}>Opis</Text>
				<TextInput
					style={styles.input}
					placeholder="Napisz coś o sobie…"
					placeholderTextColor={colors.placeholder}
					value={description}
					onChangeText={setDescription}
					multiline
					textAlignVertical="top"
					maxLength={MAX_DESCRIPTION}
					editable={!loading}
				/>
				<Text style={styles.counter}>
					{description.length}/{MAX_DESCRIPTION}
				</Text>
				<Pressable
					style={[styles.button, loading && styles.buttonDisabled]}
					onPress={handleSubmit}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color={colors.onAccent} size="small" />
					) : (
						<Text style={styles.buttonText}>Zapisz</Text>
					)}
				</Pressable>
				<Pressable
					style={styles.linkButton}
					onPress={() => navigation.goBack()}
					disabled={loading}
				>
					<Text style={styles.linkText}>Anuluj</Text>
				</Pressable>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg,
		alignItems: 'center',
	},
	title: {
		fontSize: 24,
		color: colors.textMuted,
		marginBottom: 24,
		marginTop: 40,
	},
	form: {
		alignItems: 'stretch',
		paddingHorizontal: 24,
		width: '100%',
		maxWidth: 360,
	},
	label: {
		color: colors.accent,
		fontWeight: '600',
		marginBottom: 8,
		fontSize: 14,
	},
	errorMessage: {
		fontSize: 14,
		color: colors.dangerText,
		marginBottom: 16,
		textAlign: 'center',
	},
	input: {
		minHeight: 140,
		marginBottom: 8,
		color: colors.text,
		backgroundColor: colors.bgElevated,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 5,
		paddingVertical: 10,
		paddingHorizontal: 12,
		fontSize: 16,
	},
	counter: {
		alignSelf: 'flex-end',
		color: colors.accent,
		fontSize: 13,
		marginBottom: 20,
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		paddingVertical: 7,
		paddingHorizontal: 14,
		minWidth: 120,
		minHeight: 34,
		backgroundColor: colors.accent,
		borderRadius: 5,
	},
	buttonDisabled: {
		opacity: 0.85,
	},
	buttonText: {
		color: colors.onAccent,
		fontWeight: '600',
	},
	linkButton: {
		marginTop: 16,
		padding: 8,
		alignSelf: 'center',
	},
	linkText: {
		color: colors.accent,
		fontSize: 15,
	},
});

export default EditPlayerProfileScreen;
