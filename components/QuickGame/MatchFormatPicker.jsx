import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
	DEFAULT_MATCH_FORMAT,
	GAME_TYPE_CRICKET,
	GAME_TYPE_X01,
	STARTING_SCORE_OPTIONS,
	formatMatchLabel,
	isCricketFormat,
	normalizeMatchFormat,
} from '../../helpers/matchFormat/matchFormat';
import { colors } from '../../theme/colors';

const LEGS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const SETS_OPTIONS = [1, 2, 3];

function stepInOptions(options, current, delta) {
	const idx = options.indexOf(current);
	const safeIdx = idx >= 0 ? idx : 0;
	const nextIdx = Math.min(options.length - 1, Math.max(0, safeIdx + delta));
	return options[nextIdx];
}

function Stepper({ label, value, onDecrement, onIncrement, disabled }) {
	return (
		<View style={styles.stepperBlock}>
			<Text style={styles.label}>{label}</Text>
			<View style={styles.countRow}>
				<Pressable
					style={[styles.countBtn, disabled && styles.countBtnDisabled]}
					onPress={onDecrement}
					disabled={disabled}
				>
					<Text style={styles.countBtnText}>−</Text>
				</Pressable>
				<Text style={styles.countValue}>{value}</Text>
				<Pressable
					style={[styles.countBtn, disabled && styles.countBtnDisabled]}
					onPress={onIncrement}
					disabled={disabled}
				>
					<Text style={styles.countBtnText}>+</Text>
				</Pressable>
			</View>
		</View>
	);
}

export default function MatchFormatPicker({
	value,
	onChange,
	disabled = false,
	allowCricket = true,
}) {
	const format = normalizeMatchFormat(value);
	const cricket = isCricketFormat(format);

	const setField = (patch) => onChange(normalizeMatchFormat({ ...format, ...patch }));

	return (
		<View style={styles.wrap}>
			<Text style={styles.sectionLabel}>Format gry</Text>
			<Text style={styles.preview}>{formatMatchLabel(format)}</Text>

			{allowCricket && (
				<View style={styles.typeRow}>
					<Pressable
						style={[
							styles.typeBtn,
							!cricket && styles.typeBtnActive,
							disabled && styles.countBtnDisabled,
						]}
						disabled={disabled}
						onPress={() => setField({ gameType: GAME_TYPE_X01 })}
					>
						<Text style={[styles.typeBtnText, !cricket && styles.typeBtnTextActive]}>
							501 / X01
						</Text>
					</Pressable>
					<Pressable
						style={[
							styles.typeBtn,
							cricket && styles.typeBtnActive,
							disabled && styles.countBtnDisabled,
						]}
						disabled={disabled}
						onPress={() =>
							setField({
								gameType: GAME_TYPE_CRICKET,
								setsToWinMatch: 1,
							})
						}
					>
						<Text style={[styles.typeBtnText, cricket && styles.typeBtnTextActive]}>
							Cricket
						</Text>
					</Pressable>
				</View>
			)}

			{!cricket && (
				<Stepper
					label="Punkty startowe"
					value={format.startingScore}
					disabled={disabled}
					onDecrement={() =>
						setField({
							startingScore: stepInOptions(
								STARTING_SCORE_OPTIONS,
								format.startingScore,
								-1,
							),
						})
					}
					onIncrement={() =>
						setField({
							startingScore: stepInOptions(
								STARTING_SCORE_OPTIONS,
								format.startingScore,
								1,
							),
						})
					}
				/>
			)}

			<Stepper
				label={cricket ? 'Legi do wygrania meczu' : 'Legi do wygrania seta'}
				value={format.legsToWinSet}
				disabled={disabled}
				onDecrement={() =>
					setField({
						legsToWinSet: stepInOptions(LEGS_OPTIONS, format.legsToWinSet, -1),
					})
				}
				onIncrement={() =>
					setField({
						legsToWinSet: stepInOptions(LEGS_OPTIONS, format.legsToWinSet, 1),
					})
				}
			/>

			{!cricket && (
				<Stepper
					label="Sety do wygrania meczu"
					value={format.setsToWinMatch}
					disabled={disabled}
					onDecrement={() =>
						setField({
							setsToWinMatch: stepInOptions(
								SETS_OPTIONS,
								format.setsToWinMatch,
								-1,
							),
						})
					}
					onIncrement={() =>
						setField({
							setsToWinMatch: stepInOptions(
								SETS_OPTIONS,
								format.setsToWinMatch,
								1,
							),
						})
					}
				/>
			)}
		</View>
	);
}

export { DEFAULT_MATCH_FORMAT };

const styles = StyleSheet.create({
	wrap: { marginBottom: 16 },
	sectionLabel: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 6,
		color: colors.text,
		textAlign: 'center',
	},
	preview: {
		fontSize: 16,
		color: colors.accent,
		marginBottom: 12,
		textAlign: 'center',
		fontWeight: '500',
	},
	typeRow: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 12,
		justifyContent: 'center',
	},
	typeBtn: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 8,
		borderWidth: 1.5,
		borderColor: colors.borderStrong,
		backgroundColor: colors.bgElevated,
		alignItems: 'center',
	},
	typeBtnActive: {
		borderColor: colors.accent,
		backgroundColor: colors.bgElevated,
	},
	typeBtnText: {
		fontSize: 15,
		color: colors.textMuted,
		fontWeight: '600',
	},
	typeBtnTextActive: {
		color: colors.accent,
	},
	stepperBlock: {
		marginTop: 8,
		marginBottom: 4,
	},
	label: {
		fontSize: 14,
		fontWeight: '500',
		marginBottom: 14,
		color: colors.text,
	},
	countRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 20,
	},
	countBtn: {
		width: 44,
		height: 44,
		borderRadius: 8,
		backgroundColor: colors.bgElevated,
		borderWidth: 1.5,
		borderColor: colors.borderStrong,
		alignItems: 'center',
		justifyContent: 'center',
	},
	countBtnDisabled: {
		opacity: 0.4,
	},
	countBtnText: {
		fontSize: 24,
		color: colors.text,
		fontWeight: '600',
	},
	countValue: {
		fontSize: 28,
		color: colors.accent,
		minWidth: 64,
		textAlign: 'center',
	},
});
