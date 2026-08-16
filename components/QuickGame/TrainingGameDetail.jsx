import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { formatAverage, hasAverage } from '../../helpers/formatAverage';
import { formatMatchLabel } from '../../helpers/matchFormat/matchFormat';
import {
	formatTrainingGameDate,
	formatTrainingGameTitle,
} from '../../helpers/trainingHistory/buildTrainingGameRecord';
import { getTrainingGameById } from '../../helpers/trainingHistory/persistTrainingHistory';
import { colors } from '../../theme/colors';

const StatRow = ({ label, value }) => (
	<View style={styles.statRow}>
		<Text style={styles.statLabel}>{label}</Text>
		<Text style={styles.statValue}>
			{value == null || value === '' ? '-' : String(value)}
		</Text>
	</View>
);

const PlayerBlock = ({ player, hideX01Stats }) => (
	<View style={styles.playerBlock}>
		<Text style={styles.playerName}>{player.name}</Text>
		<StatRow label="Wygrane legi" value={player.legsWon} />
		{!hideX01Stats && (player.setsWon ?? 0) > 0 ? (
			<StatRow label="Sety" value={player.setsWon} />
		) : null}
		{player.score != null ? (
			<StatRow label="Wynik Bob's 27" value={player.score} />
		) : null}
		{!hideX01Stats ? (
			<>
				<StatRow
					label="Średnia (3 lotki)"
					value={
						hasAverage(player.matchAverage)
							? formatAverage(player.matchAverage)
							: '-'
					}
				/>
				<StatRow
					label="Najlepsza średnia lega"
					value={
						hasAverage(player.bestLegAverage)
							? formatAverage(player.bestLegAverage)
							: '-'
					}
				/>
				<StatRow
					label="Najszybszy leg (lotki)"
					value={player.bestLegDarts ?? '-'}
				/>
				<StatRow label="60+" value={player.plus60 ?? 0} />
				<StatRow label="80+" value={player.plus80 ?? 0} />
				<StatRow label="100+" value={player.plus100 ?? 0} />
				<StatRow label="140+" value={player.plus140 ?? 0} />
				<StatRow label="180" value={player.max180 ?? 0} />
			</>
		) : null}
	</View>
);

const LegsBrowser = ({ legs }) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	if (!legs?.length) {
		return null;
	}

	const safeIndex = Math.min(selectedIndex, legs.length - 1);
	const leg = legs[safeIndex];

	return (
		<View style={styles.legsSection}>
			<Text style={styles.legsTitle}>Przegląd legów</Text>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.legButtonsRow}
			>
				{legs.map((item, index) => {
					const active = index === safeIndex;
					return (
						<Pressable
							key={item.legNumber ?? index}
							style={[styles.legButton, active && styles.legButtonActive]}
							onPress={() => setSelectedIndex(index)}
						>
							<Text
								style={[
									styles.legButtonText,
									active && styles.legButtonTextActive,
								]}
							>
								Leg {item.legNumber ?? index + 1}
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>

			<View style={styles.legDetail}>
				{leg.winnerName ? (
					<Text style={styles.legWinner}>
						Zwycięzca: {leg.winnerName}
						{leg.dartsToFinish
							? ` · leg zakończony w ${leg.dartsToFinish} lotkach`
							: ''}
					</Text>
				) : null}
				{(leg.players ?? []).map((p) => (
					<StatRow
						key={p.name}
						label={p.name}
						value={
							hasAverage(p.average) ? formatAverage(p.average) : '-'
						}
					/>
				))}
			</View>
		</View>
	);
};

const TrainingGameDetail = ({ route }) => {
	const gameId = route?.params?.gameId;
	const [game, setGame] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		if (!gameId) {
			setLoading(false);
			return undefined;
		}
		getTrainingGameById(gameId).then((g) => {
			if (!cancelled) {
				setGame(g);
				setLoading(false);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [gameId]);

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator color={colors.accent} />
			</View>
		);
	}

	if (!game) {
		return (
			<View style={styles.centered}>
				<Text style={styles.emptyText}>Nie znaleziono tego treningu.</Text>
			</View>
		);
	}

	const isCricket = game.gameType === 'cricket';
	const isBob27 = game.gameType === 'bob27';
	const hideX01Stats = isCricket || isBob27;

	return (
		<ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
			<Text style={styles.title}>{formatTrainingGameTitle(game)}</Text>
			<Text style={styles.meta}>{formatTrainingGameDate(game.playedAt)}</Text>
			{game.winnerName ? (
				<Text style={styles.winner}>Zwycięzca: {game.winnerName}</Text>
			) : null}
			{game.matchFormat ? (
				<Text style={styles.format}>{formatMatchLabel(game.matchFormat)}</Text>
			) : isCricket ? (
				<Text style={styles.format}>Cricket</Text>
			) : isBob27 ? (
				<Text style={styles.format}>Bob's 27</Text>
			) : null}

			{(game.players ?? []).map((p) => (
				<PlayerBlock key={p.name} player={p} hideX01Stats={hideX01Stats} />
			))}

			{!hideX01Stats ? <LegsBrowser legs={game.legs} /> : null}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	scroll: {
		flex: 1,
		backgroundColor: colors.bg,
	},
	container: {
		padding: 20,
		paddingBottom: 40,
	},
	centered: {
		flex: 1,
		backgroundColor: colors.bg,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
	},
	title: {
		fontSize: 20,
		color: colors.accent,
		fontWeight: '600',
		textAlign: 'center',
		marginBottom: 8,
	},
	meta: {
		fontSize: 14,
		color: colors.textMuted,
		textAlign: 'center',
		marginBottom: 4,
	},
	winner: {
		fontSize: 15,
		color: colors.text,
		fontWeight: '600',
		textAlign: 'center',
		marginBottom: 4,
	},
	format: {
		fontSize: 13,
		color: colors.textDim,
		textAlign: 'center',
		marginBottom: 20,
	},
	emptyText: {
		color: colors.textDim,
		fontSize: 15,
		textAlign: 'center',
	},
	playerBlock: {
		backgroundColor: colors.bgElevated,
		borderRadius: 8,
		padding: 14,
		marginBottom: 14,
	},
	playerName: {
		fontSize: 17,
		color: colors.accent,
		fontWeight: '700',
		marginBottom: 10,
	},
	statRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 6,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.border,
	},
	statLabel: {
		fontSize: 14,
		color: colors.textMuted,
		flex: 1,
		paddingRight: 8,
	},
	statValue: {
		fontSize: 14,
		color: colors.text,
		fontWeight: '600',
	},
	legsSection: {
		marginTop: 10,
	},
	legsTitle: {
		fontSize: 17,
		color: colors.accent,
		fontWeight: '600',
		marginBottom: 12,
	},
	legButtonsRow: {
		flexDirection: 'row',
		gap: 8,
		paddingBottom: 12,
	},
	legButton: {
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: colors.accentBorder,
		backgroundColor: 'transparent',
	},
	legButtonActive: {
		backgroundColor: colors.accent,
		borderColor: colors.accent,
	},
	legButtonText: {
		fontSize: 14,
		color: colors.textMuted,
		fontWeight: '600',
	},
	legButtonTextActive: {
		color: colors.onAccent,
	},
	legDetail: {
		backgroundColor: colors.bgElevated,
		borderRadius: 8,
		padding: 14,
	},
	legWinner: {
		fontSize: 14,
		color: colors.accent,
		fontWeight: '600',
		marginBottom: 12,
	},
});

export default TrainingGameDetail;
