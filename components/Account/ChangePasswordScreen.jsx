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
import { changePassword } from '../../helpers/authApi';
import { colors } from '../../theme/colors';

const ChangePasswordScreen = ({ navigation }) => {
	const { auth } = useAuth();
	const [currentPassword, setCurrentPassword] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const [loading, setLoading] = useState(false);

	const parseErrorMessage = (data) => {
		if (typeof data?.message === 'string' && !data?.errors) {
			return data.message;
		}
		const firstField = data?.errors ? Object.values(data.errors)?.[0] : null;
		if (Array.isArray(firstField) && firstField[0]) {
			return firstField[0];
		}
		if (typeof data?.message === 'string') {
			return data.message;
		}
		return 'Nie udało się zmienić hasła';
	};

	const handleSubmit = async () => {
		if (loading) return;
		setErrorMsg('');
		setSuccessMsg('');

		if (!currentPassword || !password || !passwordConfirmation) {
			setErrorMsg('Wypełnij wszystkie pola');
			return;
		}

		if (password !== passwordConfirmation) {
			setErrorMsg('Hasła nie są identyczne');
			return;
		}

		if (password.length < 8) {
			setErrorMsg('Nowe hasło musi mieć co najmniej 8 znaków');
			return;
		}

		if (!auth?.accessToken) {
			setErrorMsg('Brak sesji — zaloguj się ponownie');
			return;
		}

		setLoading(true);

		try {
			const { ok, data } = await changePassword(auth.accessToken, {
				currentPassword,
				password,
				passwordConfirmation,
			});

			if (!ok) {
				setErrorMsg(parseErrorMessage(data));
				return;
			}

			setCurrentPassword('');
			setPassword('');
			setPasswordConfirmation('');
			setSuccessMsg(data?.message || 'Hasło zostało zmienione.');
		} catch {
			setErrorMsg('Nie udało się połączyć z serwerem');
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Zmień hasło</Text>
			<View style={styles.form}>
				{!!errorMsg && <Text style={styles.errorMessage}>{errorMsg}</Text>}
				{!!successMsg && <Text style={styles.successMessage}>{successMsg}</Text>}
				<TextInput
					style={styles.input}
					placeholder="Aktualne hasło"
					placeholderTextColor={colors.placeholder}
					value={currentPassword}
					onChangeText={setCurrentPassword}
					secureTextEntry
					autoCapitalize="none"
					editable={!loading}
				/>
				<TextInput
					style={styles.input}
					placeholder="Nowe hasło"
					placeholderTextColor={colors.placeholder}
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					autoCapitalize="none"
					editable={!loading}
				/>
				<TextInput
					style={styles.input}
					placeholder="Powtórz nowe hasło"
					placeholderTextColor={colors.placeholder}
					value={passwordConfirmation}
					onChangeText={setPasswordConfirmation}
					secureTextEntry
					autoCapitalize="none"
					editable={!loading}
				/>
				<Pressable
					style={[styles.button, loading && styles.buttonDisabled]}
					onPress={handleSubmit}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color={colors.onAccent} size="small" />
					) : (
						<Text style={styles.buttonText}>Zapisz hasło</Text>
					)}
				</Pressable>
				<Pressable
					style={styles.linkButton}
					onPress={() => navigation.goBack()}
					disabled={loading}
				>
					<Text style={styles.linkText}>Wróć</Text>
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
		marginBottom: 40,
		marginTop: 60,
	},
	form: {
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	errorMessage: {
		fontSize: 14,
		color: colors.dangerText,
		marginBottom: 16,
		textAlign: 'center',
	},
	successMessage: {
		fontSize: 14,
		color: colors.successBright,
		marginBottom: 16,
		textAlign: 'center',
	},
	input: {
		marginBottom: 20,
		color: colors.text,
		backgroundColor: colors.bgElevated,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 5,
		width: 260,
		paddingVertical: 8,
		paddingHorizontal: 10,
		fontSize: 16,
	},
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 12,
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
		marginTop: 20,
		padding: 8,
	},
	linkText: {
		color: colors.accent,
		fontSize: 15,
	},
});

export default ChangePasswordScreen;
