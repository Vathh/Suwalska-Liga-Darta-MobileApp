import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

function rowHeightForPlayerCount(n) {
	if (n <= 2) return 48;
	if (n <= 4) return 42;
	return 36;
}

export default function Catch40Counter({
	players,
	catch40States,
	currentPlayerIndex,
	gameClosed = false,
	localVisitRemaining = null,
	legsToWin = 2,
}) {
	const N = players?.length ?? 0;
	if (N < 1) return null;
	const rowHeight = rowHeightForPlayerCount(N);
	const current = catch40States[currentPlayerIndex] ?? {};
	const remainingDisplay = current.finished
		? 0
		: (currentPlayerIndex >= 0 && localVisitRemaining != null
			? localVisitRemaining
			: (current.remaining ?? 61));

	return (
		<View style={styles.container}>
			<View style={styles.remainingCard}>
				<Text style={styles.kicker}>
					{current.finished ? 'Gotowe' : 'Pozostało do zamknięcia'}
				</Text>
				<Text style={styles.remainingValue}>
					{current.finished ? '—' : remainingDisplay}
				</Text>
				<Text style={styles.meta}>
					{current.finished
						? 'Czekasz na resztę'
						: `Out ${current.outNumber ?? 61} · ${current.dartsUsed ?? 0}/6 lotek · ${current.catch40Score ?? 0} pkt`}
				</Text>
				<Text style={styles.subMeta}>
					Catch 40 · do {legsToWin} {legsToWin === 1 ? 'lega' : 'legów'}
					{gameClosed ? ' · koniec' : ''}
				</Text>
			</View>

			<View style={[styles.tableWrapper, N > 4 && styles.tableWrapperTall]}>
				<View style={styles.tableHeader}>
					<Text style={[styles.colName, styles.headerText]}>Gracz</Text>
					<View style={styles.colRemain}>
						<Text style={[styles.headerText, styles.remainHeaderText]}>Zostało</Text>
					</View>
					<Text style={[styles.colEtap, styles.headerText]}>Etap</Text>
					<Text style={[styles.colDarts, styles.headerText]}>Lotki</Text>
					<Text style={[styles.colPts, styles.headerText]}>Pkt</Text>
				</View>
				<ScrollView contentContainerStyle={styles.tableContent}>
					{players.slice(0, N).map((p, i) => {
						const st = catch40States[i] ?? {};
						const active = i === currentPlayerIndex && !gameClosed;
						const remain = st.finished
							? 0
							: (active && localVisitRemaining != null
								? localVisitRemaining
								: (st.remaining ?? 61));
						return (
							<View
								key={i}
								style={[
									styles.playerRow,
									{ minHeight: rowHeight },
									active && styles.playerRowActive,
								]}
							>
								<Text style={styles.colName} numberOfLines={1}>
									{p?.name ?? 'Gracz'}
									<Text style={styles.legsInline}> ({st.legsWon ?? 0})</Text>
								</Text>
								<View style={styles.colRemain}>
									<View style={[styles.remainBadge, active && styles.remainBadgeActive]}>
										<Text style={styles.remainBadgeText}>
											{st.finished ? '—' : remain}
										</Text>
									</View>
								</View>
								<Text style={styles.colEtap}>
									{st.finished ? '—' : (st.outNumber ?? 61)}
								</Text>
								<Text style={styles.colDarts}>
									{st.finished ? 'ok' : `${st.dartsUsed ?? 0}/6`}
								</Text>
								<Text style={styles.colPts}>
									{st.catch40Score ?? 0}
								</Text>
							</View>
						);
					})}
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 0,
		flexShrink: 0,
	},
	remainingCard: {
		marginHorizontal: 12,
		marginBottom: 8,
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: colors.accentBorder,
		backgroundColor: colors.accentMuted,
		alignItems: 'center',
	},
	kicker: {
		color: colors.textMuted,
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 0.8,
		textTransform: 'uppercase',
	},
	remainingValue: {
		color: colors.accent,
		fontSize: 48,
		fontWeight: '800',
		lineHeight: 54,
		marginTop: 2,
	},
	meta: {
		color: colors.text,
		fontSize: 14,
		fontWeight: '600',
		marginTop: 2,
		textAlign: 'center',
	},
	subMeta: {
		color: colors.textDim,
		fontSize: 12,
		marginTop: 2,
		textAlign: 'center',
	},
	tableWrapper: {
		marginHorizontal: 12,
		marginBottom: 8,
		maxHeight: 140,
		backgroundColor: colors.scrimStrong,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	tableWrapperTall: {
		maxHeight: 180,
	},
	tableHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 6,
		borderBottomWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.scrimMild,
	},
	headerText: {
		color: colors.textDim,
		fontSize: 11,
		fontWeight: '700',
		textTransform: 'uppercase',
	},
	remainHeaderText: {
		color: colors.accent,
		textAlign: 'center',
	},
	tableContent: {
		paddingBottom: 4,
	},
	playerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderColor: colors.border,
	},
	playerRowActive: {
		backgroundColor: colors.accentSoft,
	},
	colRemain: {
		width: 64,
		paddingRight: 8,
		alignItems: 'stretch',
		justifyContent: 'center',
	},
	remainBadge: {
		backgroundColor: colors.accentMuted,
		borderWidth: 1,
		borderColor: colors.accentBorder,
		borderRadius: 8,
		paddingVertical: 4,
		paddingHorizontal: 4,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 28,
	},
	remainBadgeActive: {
		backgroundColor: colors.accentSoftStrong,
		borderColor: colors.accent,
	},
	remainBadgeText: {
		color: colors.accent,
		fontSize: 20,
		fontWeight: '800',
		letterSpacing: 0.3,
		textAlign: 'center',
	},
	colEtap: {
		width: 40,
		color: colors.text,
		fontSize: 16,
		fontWeight: '700',
		textAlign: 'right',
		paddingRight: 8,
	},
	colName: {
		flex: 1,
		color: colors.textSecondary,
		fontSize: 15,
		paddingRight: 8,
	},
	colDarts: {
		width: 48,
		color: colors.textMuted,
		fontSize: 13,
		textAlign: 'right',
	},
	colPts: {
		width: 36,
		color: colors.text,
		fontSize: 16,
		fontWeight: '700',
		textAlign: 'right',
	},
	legsInline: {
		color: colors.accent,
		fontWeight: '700',
	},
});
