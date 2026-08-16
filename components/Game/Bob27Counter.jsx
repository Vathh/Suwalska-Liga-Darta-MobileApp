import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { bob27TargetLabel, bob27TargetValue } from '../../helpers/bob27';
import { colors } from '../../theme/colors';

function rowHeightForPlayerCount(n) {
	if (n <= 2) return 56;
	if (n <= 4) return 48;
	if (n <= 6) return 40;
	return 34;
}

export default function Bob27Counter({
	players,
	bob27States,
	currentPlayerIndex,
	currentTargetIndex = 0,
	dartsInVisit = 0,
	hitsInVisit = 0,
	onHit,
	onMiss,
	onUndo,
	gameClosed = false,
	mode = 'hard',
}) {
	const N = players?.length ?? 0;
	if (N < 1) return null;
	const rowHeight = rowHeightForPlayerCount(N);
	const targetLabel = bob27TargetLabel(currentTargetIndex);
	const targetValue = bob27TargetValue(currentTargetIndex);

	return (
		<View style={styles.container}>
			<View style={styles.targetCard}>
				<Text style={styles.targetKicker}>Cel</Text>
				<Text style={styles.targetLabel}>{targetLabel}</Text>
				<Text style={styles.targetMeta}>
					trafienie +{targetValue} · 3 pudła −{targetValue}
					{mode === 'easy' ? ' · easy' : ' · hard'}
				</Text>
				<View style={styles.dartRow}>
					{[0, 1, 2].map((i) => {
						const thrown = i < dartsInVisit;
						const hit = i < hitsInVisit;
						return (
							<View
								key={i}
								style={[
									styles.dartDot,
									thrown && (hit ? styles.dartDotHit : styles.dartDotMiss),
								]}
							/>
						);
					})}
				</View>
			</View>

			<View style={styles.tableWrapper}>
				<ScrollView contentContainerStyle={styles.tableContent}>
					{players.slice(0, N).map((p, i) => {
						const st = bob27States[i] ?? {};
						const active = i === currentPlayerIndex && !gameClosed;
						return (
							<View
								key={i}
								style={[
									styles.playerRow,
									{ minHeight: rowHeight },
									active && styles.playerRowActive,
									st.eliminated && styles.playerRowOut,
								]}
							>
								<Text style={styles.playerName} numberOfLines={1}>
									{p?.name ?? 'Gracz'}
									<Text style={styles.legsInline}> ({st.legsWon ?? 0})</Text>
								</Text>
								<Text style={[styles.playerScore, st.eliminated && styles.playerOut]}>
									{st.eliminated ? 'OUT' : (st.score ?? 27)}
								</Text>
							</View>
						);
					})}
				</ScrollView>
			</View>

			<View style={styles.bottomSection}>
				<View style={styles.scoreSection}>
					<Text style={styles.dartInfo}>Rzut {Math.min(dartsInVisit + 1, 3)}/3</Text>
					<Pressable style={styles.undoBtn} onPress={onUndo} disabled={gameClosed}>
						<Text style={styles.undoText}>Cofnij</Text>
					</Pressable>
				</View>
				<View style={styles.actionRow}>
					<Pressable
						style={[styles.actionBtn, styles.hitBtn, gameClosed && styles.btnDisabled]}
						onPress={onHit}
						disabled={gameClosed}
					>
						<Text style={styles.hitText}>Trafiony</Text>
					</Pressable>
					<Pressable
						style={[styles.actionBtn, styles.missBtn, gameClosed && styles.btnDisabled]}
						onPress={onMiss}
						disabled={gameClosed}
					>
						<Text style={styles.missText}>Pudło</Text>
					</Pressable>
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
	dartRow: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 12,
	},
	dartDot: {
		width: 14,
		height: 14,
		borderRadius: 7,
		borderWidth: 1.5,
		borderColor: colors.borderStrong,
		backgroundColor: 'transparent',
	},
	dartDotHit: {
		backgroundColor: colors.success,
		borderColor: colors.success,
	},
	dartDotMiss: {
		backgroundColor: colors.danger,
		borderColor: colors.danger,
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
	playerRowOut: {
		opacity: 0.55,
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
	playerOut: {
		color: colors.dangerAlt,
		fontSize: 16,
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
	dartInfo: {
		flex: 1,
		color: colors.textDim,
		fontSize: 14,
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
		gap: 12,
		paddingHorizontal: 12,
		paddingTop: 12,
	},
	actionBtn: {
		flex: 1,
		paddingVertical: 16,
		borderRadius: 10,
		alignItems: 'center',
		borderWidth: 2,
	},
	hitBtn: {
		backgroundColor: colors.successMuted,
		borderColor: colors.success,
	},
	missBtn: {
		backgroundColor: colors.dangerMuted,
		borderColor: colors.danger,
	},
	hitText: {
		color: colors.successBright,
		fontSize: 18,
		fontWeight: '800',
	},
	missText: {
		color: colors.dangerText,
		fontSize: 18,
		fontWeight: '800',
	},
	btnDisabled: {
		opacity: 0.4,
	},
});
