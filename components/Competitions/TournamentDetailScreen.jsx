import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { fetchCompetitionDetail } from '../../helpers/competitionsApi';
import { getTournamentUrl } from '../../helpers/apiConfig';
import DetailHeader from './DetailHeader';
import ScreenLoading from '../Common/ScreenLoading';
import CompetitionTabs from './CompetitionTabs';
import CompetitionTable from './CompetitionTable';
import PlayoffBracket from './PlayoffBracket';
import { colors } from '../../theme/colors';

const TAB_LABELS = {
	results: 'Wyniki',
	groups: 'Grupy',
	playoff: 'Playoff',
	achievements: 'Osiągnięcia',
};

const RESULTS_COLUMNS_BASE = [
	{ key: 'place', label: '#', width: 40 },
	{ key: 'player', label: 'Zawodnik', width: 150, align: 'left', player: true },
	{ key: 'stageLabel', label: 'Etap', width: 120, align: 'left' },
];

const GROUP_STANDINGS_COLUMNS = [
	{ key: 'place', label: '#', width: 36 },
	{ key: 'player', label: 'Zawodnik', width: 130, align: 'left', player: true },
	{ key: 'gamesWon', label: 'Z', width: 36 },
	{ key: 'gamesLost', label: 'P', width: 36 },
	{ key: 'matchUnitsDifference', label: '+/−', width: 44 },
	{ key: 'points', label: 'Pkt', width: 44 },
];

const TournamentDetailScreen = ({ navigation, route }) => {
	const { auth } = useAuth();
	const tournamentId = route.params?.id;
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [activeTab, setActiveTab] = useState('results');

	const load = useCallback(
		async ({ soft } = {}) => {
			if (!auth?.accessToken || !tournamentId) {
				setError('Brak danych turnieju.');
				setLoading(false);
				return;
			}
			if (!soft) setLoading(true);

			const result = await fetchCompetitionDetail(
				getTournamentUrl(tournamentId),
				auth.accessToken,
			);
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
		[auth?.accessToken, tournamentId],
	);

	useFocusEffect(
		useCallback(() => {
			void load();
		}, [load]),
	);

	const tabs = useMemo(
		() =>
			(data?.availableTabs ?? []).map((key) => ({
				key,
				label: TAB_LABELS[key] ?? key,
			})),
		[data?.availableTabs],
	);

	useEffect(() => {
		if (tabs.length === 0) return;
		if (!tabs.some((t) => t.key === activeTab)) {
			setActiveTab(tabs[0].key);
		}
	}, [tabs, activeTab]);

	const openPlayer = (playerId, name) => {
		navigation.navigate('PlayerProfile', { playerId, name });
	};

	if (loading) {
		return <ScreenLoading />;
	}

	const tournament = data?.tournament;
	const breadcrumb = [];
	if (data?.organization) {
		breadcrumb.push({
			label: data.organization.name,
			onPress: () => navigation.navigate('OrganizationDetail', { id: data.organization.id }),
		});
	}
	if (data?.season) {
		breadcrumb.push({
			label: data.season.name,
			onPress: () => navigation.navigate('SeasonDetail', { id: data.season.id }),
		});
	}
	if (breadcrumb.length > 0) {
		breadcrumb.push({ label: 'Turniej' });
	}

	const showStageInResults = tournament?.showStageInResults !== false;
	const resultsColumns = (() => {
		const cols = [
			RESULTS_COLUMNS_BASE[0],
			RESULTS_COLUMNS_BASE[1],
		];
		if (tournament?.tracksSeasonPoints) {
			cols.push({ key: 'points', label: 'Pkt', width: 48 });
		}
		if (showStageInResults) {
			cols.push(RESULTS_COLUMNS_BASE[2]);
		}
		return cols;
	})();

	const resultsRows = (data?.results ?? []).map((row) => ({
		...row,
		player: {
			text: row.playerName,
			playerId: row.userId ? row.playerId : null,
			name: row.playerName,
		},
	}));

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

			{tournament ? (
				<>
					<DetailHeader
						title={tournament.name}
						statusLabel={tournament.statusLabel}
						statusVariant={tournament.statusVariant}
						eyebrow={data?.season ? null : 'Turniej jednorazowy'}
						breadcrumb={breadcrumb}
						meta={[{ label: 'Data rozgrywek', value: tournament.date || '—' }]}
					/>

					{tabs.length === 0 ? (
						<Text style={styles.empty}>
							Turniej jeszcze się nie rozpoczął. Wyniki i tabele pojawią się po starcie.
						</Text>
					) : (
						<>
							<CompetitionTabs
								tabs={tabs}
								activeKey={activeTab}
								onChange={setActiveTab}
							/>

							{activeTab === 'results' ? (
								<CompetitionTable
									columns={resultsColumns}
									rows={resultsRows}
									emptyText="Brak wyników — pojawią się po odpadnięciu zawodników z turnieju."
									onPlayerPress={openPlayer}
								/>
							) : null}

							{activeTab === 'groups' ? (
								(data?.groups ?? []).length === 0 ? (
									<Text style={styles.empty}>Brak grup.</Text>
								) : (
									(data?.groups ?? []).map((group) => (
										<View key={group.groupNumber} style={styles.groupBlock}>
											<Text style={styles.sectionTitle}>
												Grupa {group.groupNumber}
											</Text>
											<CompetitionTable
												columns={GROUP_STANDINGS_COLUMNS}
												rows={(group.standings ?? []).map((row) => ({
													...row,
													player: {
														text: row.playerName,
														playerId: row.userId ? row.playerId : null,
														name: row.playerName,
													},
												}))}
												emptyText="Brak tabeli."
												onPlayerPress={openPlayer}
											/>
											<Text style={styles.subSection}>Mecze</Text>
											{(group.games ?? []).length === 0 ? (
												<Text style={styles.empty}>Brak meczów.</Text>
											) : (
												(group.games ?? []).map((game) => (
													<View key={game.id} style={styles.gameRow}>
														<Text style={styles.gameNames} numberOfLines={1}>
															{game.player1?.name ?? 'TBD'} —{' '}
															{game.player2?.name ?? 'TBD'}
														</Text>
														<Text style={styles.gameScore}>
															{formatScore(game)}
														</Text>
													</View>
												))
											)}
										</View>
									))
								)
							) : null}

							{activeTab === 'playoff' ? (
								<PlayoffBracket
									rounds={data?.playoff ?? []}
									onPlayerPress={openPlayer}
								/>
							) : null}

							{activeTab === 'achievements' ? (
								(data?.achievements ?? []).length === 0 ? (
									<Text style={styles.empty}>Brak osiągnięć.</Text>
								) : (
									(data?.achievements ?? []).map((row) => (
										<View key={row.playerId ?? row.playerName} style={styles.achCard}>
											<Text style={styles.achName}>{row.playerName}</Text>
											<Text style={styles.achLine}>
												180: {row.max} · 170+: {row.oneSeventy}
											</Text>
											{row.qf?.length ? (
												<Text style={styles.achLine}>
													QF: {row.qf.join(', ')} lotek
												</Text>
											) : null}
											{row.hf?.length ? (
												<Text style={styles.achLine}>HF: {row.hf.join(', ')}</Text>
											) : null}
										</View>
									))
								)
							) : null}
						</>
					)}
				</>
			) : null}
		</ScrollView>
	);
};

function formatScore(game) {
	if (game.status === 'scheduled') return 'vs';
	const s1 = game.score1 ?? 0;
	const s2 = game.score2 ?? 0;
	return `${s1} : ${s2}`;
}

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
	empty: { color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
	groupBlock: { marginBottom: 20 },
	sectionTitle: {
		marginBottom: 10,
		fontSize: 15,
		fontWeight: '700',
		color: colors.text,
	},
	subSection: {
		marginTop: 12,
		marginBottom: 8,
		fontSize: 13,
		fontWeight: '600',
		color: colors.textMuted,
	},
	gameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: colors.bgElevated,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 8,
	},
	gameNames: { flex: 1, color: colors.text, fontSize: 14 },
	gameScore: {
		color: colors.textSecondary,
		fontSize: 14,
		fontWeight: '700',
		fontVariant: ['tabular-nums'],
	},
	achCard: {
		padding: 14,
		backgroundColor: colors.bgElevated,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 10,
	},
	achName: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
	achLine: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});

export default TournamentDetailScreen;
