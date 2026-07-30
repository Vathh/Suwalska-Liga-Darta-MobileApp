import React, { useCallback, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { fetchCompetitionDetail } from '../../helpers/competitionsApi';
import { getLeagueUrl } from '../../helpers/apiConfig';
import DetailHeader from './DetailHeader';
import { colors } from '../../theme/colors';

const LeagueDetailScreen = ({ navigation, route }) => {
	const { auth } = useAuth();
	const leagueId = route.params?.id;
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');

	const load = useCallback(
		async ({ soft } = {}) => {
			if (!auth?.accessToken || !leagueId) {
				setError('Brak danych ligi.');
				setLoading(false);
				return;
			}
			if (!soft) setLoading(true);

			const result = await fetchCompetitionDetail(getLeagueUrl(leagueId), auth.accessToken);
			if (result.error) {
				setError(result.error);
				if (!soft) setData(null);
			} else {
				setError('');
				setData(result.data);
			}
			setLoading(false);
			setRefreshing(false);
		},
		[auth?.accessToken, leagueId],
	);

	useFocusEffect(
		useCallback(() => {
			void load();
		}, [load]),
	);

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color={colors.accent} />
			</View>
		);
	}

	const league = data?.league;

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={() => {
						setRefreshing(true);
						void load({ soft: true });
					}}
					colors={[colors.accent]}
				/>
			}
		>
			{error ? <Text style={styles.error}>{error}</Text> : null}

			{league ? (
				<>
					<DetailHeader
						title={league.name}
						eyebrow="Liga"
						meta={[
							{ label: 'Opis', value: league.description?.trim() ? league.description : '—' },
							{ label: 'Utworzono', value: league.createdAt || '—' },
							{ label: 'Ostatnia aktywność', value: league.updatedAt || '—' },
							{ label: 'Sezony', value: String(data?.seasons?.length ?? 0) },
						]}
					/>

					<Text style={styles.sectionTitle}>Sezony</Text>
					{(data?.seasons ?? []).length === 0 ? (
						<Text style={styles.empty}>Brak sezonów.</Text>
					) : (
						(data?.seasons ?? []).map((season) => (
							<Pressable
								key={season.id}
								style={styles.linkCard}
								onPress={() => navigation.navigate('SeasonDetail', { id: season.id })}
							>
								<Text style={styles.linkCardText}>{season.name}</Text>
							</Pressable>
						))
					)}
				</>
			) : null}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.bg },
	content: { padding: 24, paddingBottom: 40 },
	centered: {
		flex: 1,
		backgroundColor: colors.bg,
		justifyContent: 'center',
		alignItems: 'center',
	},
	error: { color: colors.dangerText, marginBottom: 16, fontSize: 14 },
	sectionTitle: {
		marginTop: 20,
		marginBottom: 12,
		fontSize: 16,
		fontWeight: '700',
		color: colors.text,
	},
	empty: { color: colors.textMuted, fontSize: 14, marginBottom: 8 },
	linkCard: {
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: colors.bgElevated,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 10,
	},
	linkCardText: { color: colors.text, fontSize: 15, fontWeight: '600' },
});

export default LeagueDetailScreen;
