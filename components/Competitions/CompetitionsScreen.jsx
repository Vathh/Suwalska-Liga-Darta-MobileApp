import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const SECTIONS = [
	{
		key: 'leagues',
		label: 'Ligi',
		hint: 'Przeglądaj dostępne ligi',
		route: 'LeaguesList',
	},
	{
		key: 'seasons',
		label: 'Sezony',
		hint: 'Przeglądaj sezony',
		route: 'SeasonsList',
	},
	{
		key: 'tournaments',
		label: 'Turnieje',
		hint: 'Przeglądaj turnieje',
		route: 'TournamentsList',
	},
];

/** Hub: Ligi / Sezony / Turnieje (przeglądanie jak na webie). */
const CompetitionsScreen = ({ navigation }) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Rozgrywki</Text>
			<View style={styles.form}>
				{SECTIONS.map((section) => (
					<Pressable
						key={section.key}
						style={styles.button}
						onPress={() => navigation.navigate(section.route)}
					>
						<Text style={styles.buttonText}>{section.label}</Text>
						<Text style={styles.buttonHint}>{section.hint}</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg,
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	title: {
		fontSize: 24,
		color: colors.textMuted,
		marginBottom: 48,
		marginTop: 100,
		textAlign: 'center',
	},
	form: {
		alignItems: 'stretch',
		width: '100%',
		maxWidth: 320,
	},
	button: {
		alignItems: 'center',
		marginTop: 16,
		paddingVertical: 12,
		paddingHorizontal: 14,
		backgroundColor: colors.bgElevated,
		borderWidth: 1.5,
		borderColor: colors.borderStrong,
		borderRadius: 8,
	},
	buttonText: {
		color: colors.text,
		fontSize: 17,
		fontWeight: '600',
	},
	buttonHint: {
		marginTop: 5,
		fontSize: 13,
		color: colors.text,
		opacity: 0.85,
		textAlign: 'center',
	},
});

export default CompetitionsScreen;
