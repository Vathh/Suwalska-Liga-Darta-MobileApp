import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { atcMaxHits, atcTargetLabel } from '../../helpers/atc';
import { colors } from '../../theme/colors';

function rowHeightForPlayerCount(n) {
	if (n <= 2) return 56;
	if (n <= 4) return 48;
	if (n <= 6) return 40;
	return 34;
}

const HIT_OPTIONS = [0, 1, 2, 3];

export default function AtcCounter({
	players,
	atcStates,
	currentPlayerIndex,
	onVisit,
	onUndo,
	gameClosed = false,
}) {
	const N = players?.length ?? 0;
	if (N < 1) return null;
	const rowHeight = rowHeightForPlayerCount(N);
	const thrower = atcStates[currentPlayerIndex] ?? {};
	const targetIndex = thrower.targetIndex ?? 0;
	const targetLabel = atcTargetLabel(targetIndex);
	const maxHits = atcMaxHits(targetIndex);

	return (
		<View style={styles.container}>
			<View style={styles.targetCard}>
				<Text style={styles.targetKicker}>Cel</Text>
				<Text style={styles.targetLabel}>{targetLabel}</Text>
				<Text style={styles.targetMeta}>
					dowolny segment · bez przeskoków · finisz: bull
				</Text>
			</View>

			<View style={styles.tableWrapper}>
				<ScrollView contentContainerStyle={styles.tableContent}>
					{players.slice(0, N).map((p, i) => {
						const st = atcStates[i] ?? {};
						const active = i === currentPlayerIndex && !gameClosed;
						const label = atcTargetLabel(st.targetIndex ?? 0);
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
								<Text style={styles.playerScore}>{label}</Text>
							</View>
						);
					})}
				</ScrollView>
			</View>

			<View style={styles.bottomSection}>
				<View style={styles.scoreSection}>
					<Text style={styles.prompt}>Ile kolejnych numerów?</Text>
					<Pressable style={styles.undoBtn} onPress={onUndo} disabled={gameClosed}>
						<Text style={styles.undoText}>Cofnij</Text>
					</Pressable>
				</View>
				<View style={styles.actionRow}>
					{HIT_OPTIONS.map((hits) => {
						const disabled = gameClosed || hits > maxHits;
						return (
							<Pressable
								key={hits}
								style={[
									styles.hitBtn,
									hits === 0 && styles.hitBtnZero,
									hits === 3 && hits <= maxHits && styles.hitBtnThree,
									disabled && styles.btnDisabled,
								]}
								onPress={() => onVisit?.(hits)}
								disabled={disabled}
							>
								<Text
									style={[
										styles.hitBtnText,
										hits === 0 && styles.hitBtnTextZero,
										hits === 3 && hits <= maxHits && styles.hitBtnTextThree,
									]}
								>
									{hits}
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
