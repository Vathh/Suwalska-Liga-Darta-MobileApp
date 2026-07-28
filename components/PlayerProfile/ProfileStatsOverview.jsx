import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProfileStatsTable from './ProfileStatsTable';
import { colors } from '../../theme/colors';

const ProfileStatsOverview = ({ quickStats, tournamentStats }) => {
	return (
		<View style={styles.wrap}>
			<Text style={styles.sectionTitle}>Statystyki – mecze szybkie</Text>
			<ProfileStatsTable stats={quickStats} />
			<Text style={[styles.sectionTitle, styles.sectionGap]}>Statystyki – turnieje</Text>
			<ProfileStatsTable stats={tournamentStats} />
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: {
		paddingBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: colors.accent,
		marginBottom: 12,
	},
	sectionGap: {
		marginTop: 24,
	},
});

export default ProfileStatsOverview;
