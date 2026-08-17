import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
	cricket56IsBull,
	cricket56MaxMarkForRound,
	cricket56TargetLabel,
} from '../../helpers/cricket56';
import { colors } from '../../theme/colors';

function rowHeightForPlayerCount(n) {
	if (n <= 2) return 56;
	if (n <= 4) return 48;
	if (n <= 6) return 40;
	return 34;
}

const MARK_OPTIONS = [
	{ value: 0, label: '0' },
	{ value: 1, label: 'S' },
	{ value: 2, label: 'D' },
	{ value: 3, label: 'T' },
];

function markLabel(value) {
	if (value === 1) return 'S';
	if (value === 2) return 'D';
	if (value === 3) return 'T';
	return '0';
}

export default function Cricket56Counter({
	players,
	cricket56States,
	currentPlayerIndex,
	currentRoundIndex = 0,
	onVisit,
	onUndo,
	gameClosed = false,
}) {
	const N = players?.length ?? 0;
	const [visitMarks, setVisitMarks] = useState([]);
	const rowHeight = rowHeightForPlayerCount(N);
	const targetLabel = cricket56TargetLabel(currentRoundIndex);
	const maxMark = cricket56MaxMarkForRound(currentRoundIndex);
	const isBull = cricket56IsBull(currentRoundIndex);
	const dartNumber = visitMarks.length + 1;
	const visitTotal = visitMarks.reduce((sum, m) => sum + m, 0);

	useEffect(() => {
		setVisitMarks([]);
	}, [currentPlayerIndex, currentRoundIndex]);

	if (N < 1) return null;

	const handleMark = (mark) => {
		if (gameClosed) return;
		const safe = Math.max(0, Math.min(maxMark, mark));
		const next = [...visitMarks, safe];
		if (next.length >= 3) {
			setVisitMarks([]);
			onVisit?.(next.reduce((sum, m) => sum + m, 0));
			return;
		}
		setVisitMarks(next);
	};

	const handleUndo = () => {
		if (gameClosed) return;
		if (visitMarks.length > 0) {
			setVisitMarks((prev) => prev.slice(0, -1));
			return;
		}
		onUndo?.();
	};

	return (
		<View style={styles.container}>
			<View style={styles.targetCard}>
				<Text style={styles.targetKicker}>
					Runda {currentRoundIndex + 1}/7
				</Text>
				<Text style={styles.targetLabel}>{targetLabel}</Text>
				<Text style={styles.targetMeta}>
					{isBull
						? 'outer = 1 · inner = 2 · max 6 pkt'
						: 'S = 1 · D = 2 · T = 3 · max 9 pkt'}
					{' · perfect 60'}
				</Text>
			</View>

			<View style={styles.tableWrapper}>
				<ScrollView contentContainerStyle={styles.tableContent}>
					{players.slice(0, N).map((p, i) => {
						const st = cricket56States[i] ?? {};
						const active = i === currentPlayerIndex && !gameClosed;
						return (
							<View
								key={i}
								style={[
									styles.playerRow,
									{ minHeight: rowHeight },
									active && styles.playerRowActive,
								]}
							>
								<Text style={styles.playerName} numberOfLines={1}>
									{p?.name ?? 'Gracz'}
									<Text style={styles.legsInline}> ({st.legsWon ?? 0})</Text>
								</Text>
								<Text style={[styles.playerScore, active && styles.activeScore]}>
									{st.score ?? 0}
								</Text>
							</View>
						);
					})}
				</ScrollView>
			</View>

			<View style={styles.bottomSection}>
				<View style={styles.scoreSection}>
					<Text style={styles.prompt}>
						Lotka {Math.min(dartNumber, 3)}/3
						{visitMarks.length > 0
							? ` · ${visitMarks.map(markLabel).join(' · ')} = ${visitTotal}`
							: ''}
					</Text>
					<Pressable style={styles.undoBtn} onPress={handleUndo} disabled={gameClosed}>
						<Text style={styles.undoText}>Cofnij</Text>
					</Pressable>
				</View>
				<View style={styles.actionRow}>
					{MARK_OPTIONS.map((opt) => {
						const disabled = gameClosed || opt.value > maxMark;
						return (
							<Pressable
								key={opt.value}
								style={[
									styles.hitBtn,
									opt.value === 0 && styles.hitBtnZero,
									opt.value === 3 && styles.hitBtnThree,
									disabled && styles.btnDisabled,
								]}
								onPress={() => handleMark(opt.value)}
								disabled={disabled}
							>
								<Text
									style={[
										styles.hitBtnText,
										opt.value === 0 && styles.hitBtnTextZero,
										opt.value === 3 && styles.hitBtnTextThree,
									]}
								>
									{opt.label}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'space-between',
	},
	targetCard: {
		marginHorizontal: 12,
		marginBottom: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: colors.accentBorder,
		backgroundColor: colors.accentMuted,
		alignItems: 'center',
	},
	targetKicker: {
		color: colors.textMuted,
		fontSize: 13,
		fontWeight: '600',
		letterSpacing: 1,
		textTransform: 'uppercase',
	},
	targetLabel: {
		color: colors.accent,
		fontSize: 42,
		fontWeight: '800',
		marginTop: 2,
	},
	targetMeta: {
		color: colors.textDim,
		fontSize: 13,
		marginTop: 4,
		textAlign: 'center',
	},
	tableWrapper: {
		flex: 1,
		marginHorizontal: 12,
		marginBottom: 12,
		backgroundColor: colors.scrimStrong,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	tableContent: {
		paddingVertical: 8,
	},
	playerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 14,
		borderBottomWidth: 1,
		borderColor: colors.border,
	},
	playerRowActive: {
		backgroundColor: colors.accentSoft,
	},
	playerName: {
		flex: 1,
		color: colors.textSecondary,
		fontSize: 16,
		paddingRight: 12,
	},
	legsInline: {
		color: colors.accent,
		fontWeight: '700',
	},
	playerScore: {
		color: colors.text,
		fontSize: 22,
		fontWeight: '700',
		minWidth: 64,
		textAlign: 'right',
	},
	activeScore: {
		color: colors.accent,
	},
	bottomSection: {
		paddingBottom: 16,
	},
	scoreSection: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: colors.scrimMild,
	},
	prompt: {
		flex: 1,
		color: colors.text,
		fontSize: 16,
		fontWeight: '700',
	},
	undoBtn: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: colors.scrimStrong,
		borderRadius: 6,
	},
	undoText: {
		color: colors.textMuted,
		fontSize: 16,
	},
	actionRow: {
		flexDirection: 'row',
		gap: 10,
		paddingHorizontal: 12,
		paddingTop: 12,
	},
	hitBtn: {
		flex: 1,
		paddingVertical: 18,
		borderRadius: 10,
		alignItems: 'center',
		borderWidth: 2,
		backgroundColor: colors.accentMuted,
		borderColor: colors.accentBorder,
	},
	hitBtnZero: {
		backgroundColor: colors.dangerMuted,
		borderColor: colors.danger,
	},
	hitBtnThree: {
		backgroundColor: colors.successMuted,
		borderColor: colors.success,
	},
	hitBtnText: {
		color: colors.accent,
		fontSize: 28,
		fontWeight: '800',
	},
	hitBtnTextZero: {
		color: colors.dangerText,
	},
	hitBtnTextThree: {
		color: colors.successBright,
	},
	btnDisabled: {
		opacity: 0.4,
	},
});
