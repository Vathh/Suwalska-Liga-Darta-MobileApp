import React, { useCallback, useState } from 'react';
import {
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
import DetailHeader, { STATUS_STYLES } from './DetailHeader';
import ScreenLoading from '../Common/ScreenLoading';
import { colors } from '../../theme/colors';

function formatDivisionMeta(division) {
	const sets = Number(division.setsToWinMatch) || 1;
	const legs = Number(division.legsToWinSet) || 1;
	const format =
		sets > 1
			? `${division.startingScore} · do ${legs} legów / ${sets} setów`
			: `${division.startingScore} · do ${legs} legów`;
	return `${division.memberCount}/${division.capacity} · ${format}`;
}

function formatPromotion(division) {
	if ((division.position ?? 0) <= 0) {
		return null;
	}
	const parts = [`Awans: ${division.promoteDirect} bezpośredni`];
	if ((division.promotePlayoff ?? 0) > 0) {
		parts.push(`+ ${division.promotePlayoff} baraż`);
	}
	return parts.join(' ');
}

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
		return <ScreenLoading />;
	}

	const league = data?.league;
	const organization = data?.organization;
	const activeSeason = data?.activeSeason;
	const activeLabel = activeSeason
		? activeSeason.status === 'playoffs'
			? 'Sezon w trakcie rozgrywek · baraże'
			: 'Sezon w trakcie rozgrywek'
		: null;

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
						breadcrumb={
							organization
								? [
										{
											label: organization.name,
											onPress: () =>
												navigation.navigate('OrganizationDetail', {
													id: organization.id,
												}),
										},
										{ label: 'Liga' },
									]
								: []
						}
						meta={[
							{
								label: 'Opis',
								value: league.description?.trim() ? league.description : '—',
							},
						]}
					/>

					{activeSeason ? (
						<Pressable
							style={styles.liveLink}
							onPress={() =>
								navigation.navigate('LeagueSeasonDetail', { id: activeSeason.id })
							}
						>
							<Text style={styles.liveLinkText}>{activeLabel}</Text>
						</Pressable>
					) : null}

					<Text style={styles.sectionTitle}>Szczeble rozgrywek</Text>
					{(data?.divisions ?? []).length === 0 ? (
						<Text style={styles.empty}>Brak szczebli.</Text>
					) : (
						(data?.divisions ?? []).map((division) => (
							<Pressable
								key={division.id}
								style={styles.card}
								onPress={() =>
									navigation.navigate('LeagueDivisionDetail', {
										leagueId,
										divisionId: division.id,
									})
								}
							>
								<View style={styles.cardHeader}>
									<Text style={styles.cardTitle}>
										{division.position + 1}. {division.name}
									</Text>
									<Text style={styles.cardMeta}>{formatDivisionMeta(division)}</Text>
								</View>
								{formatPromotion(division) ? (
									<Text style={styles.cardSub}>{formatPromotion(division)}</Text>
								) : null}
								{(division.members ?? []).length === 0 ? (
									<Text style={styles.cardSub}>Brak zawodników.</Text>
								) : (
									<View style={styles.members}>
										{(division.members ?? []).map((member) => {
											const canOpen = Boolean(member.userId && member.playerId);
											const label = member.playerName || '—';
											if (!canOpen) {
												return (
													<Text key={`${division.id}-${member.playerId}`} style={styles.memberPlain}>
														{label}
													</Text>
												);
											}
											return (
												<Pressable
													key={`${division.id}-${member.playerId}`}
													onPress={() =>
														navigation.navigate('PlayerProfile', {
															playerId: member.playerId,
															name: label,
														})
													}
												>
													<Text style={styles.memberLink}>{label}</Text>
												</Pressable>
											);
										})}
									</View>
								)}
							</Pressable>
						))
					)}

					<Text style={styles.sectionTitle}>Sezony ligowe</Text>
					{(data?.seasons ?? []).length === 0 ? (
						<Text style={styles.empty}>Brak sezonów ligowych.</Text>
					) : (
						(data?.seasons ?? []).map((season) => {
							const statusStyle =
								STATUS_STYLES[season.statusVariant] ?? STATUS_STYLES.finished;
							return (
								<Pressable
									key={season.id}
									style={styles.card}
									onPress={() =>
										navigation.navigate('LeagueSeasonDetail', { id: season.id })
									}
								>
									<View style={styles.cardHeader}>
										<Text style={styles.cardTitle}>{season.name}</Text>
										{season.statusLabel ? (
											<View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
												<Text style={[styles.badgeText, { color: statusStyle.text }]}>
													{season.statusLabel}
												</Text>
											</View>
										) : null}
									</View>
									{season.startDate && season.endDate ? (
										<Text style={styles.cardSub}>
											{season.startDate} – {season.endDate}
										</Text>
									) : null}
								</Pressable>
							);
						})
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
		marginTop: 8,
		marginBottom: 12,
		fontSize: 16,
		fontWeight: '700',
		color: colors.text,
	},
	empty: { color: colors.textMuted, fontSize: 14, marginBottom: 8 },
	card: {
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: colors.bgElevated,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 10,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 10,
	},
	cardTitle: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
	cardMeta: { color: colors.textMuted, fontSize: 12, maxWidth: '46%', textAlign: 'right' },
	cardSub: { marginTop: 6, color: colors.textMuted, fontSize: 13 },
	members: {
		marginTop: 10,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	memberLink: { color: colors.accent, fontSize: 13, fontWeight: '600' },
	memberPlain: { color: colors.text, fontSize: 13 },
	badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
	badgeText: { fontSize: 11, fontWeight: '600' },
	liveLink: {
		alignSelf: 'flex-start',
		marginTop: -8,
		marginBottom: 16,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 6,
		backgroundColor: colors.successMuted,
	},
	liveLinkText: { color: colors.successSoftText, fontSize: 12, fontWeight: '700' },
});

export default LeagueDetailScreen;
