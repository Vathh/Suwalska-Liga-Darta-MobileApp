import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

/**
 * @param {{
 *   tabs: Array<{ key: string, label: string }>,
 *   activeKey: string,
 *   onChange: (key: string) => void,
 * }} props
 */
const CompetitionTabs = ({ tabs, activeKey, onChange }) => {
	if (!tabs || tabs.length === 0) {
		return null;
	}

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.scroll}
			contentContainerStyle={styles.content}
		>
			{tabs.map((tab) => {
				const active = tab.key === activeKey;
				return (
					<Pressable
						key={tab.key}
						style={[styles.tab, active && styles.tabActive]}
						onPress={() => onChange(tab.key)}
					>
						<Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	scroll: {
		marginBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	content: {
		paddingRight: 8,
	},
	tab: {
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderBottomWidth: 2,
		borderBottomColor: 'transparent',
		marginBottom: -1,
	},
	tabActive: {
		borderBottomColor: colors.accent,
	},
	tabText: {
		color: colors.textMuted,
		fontSize: 14,
		fontWeight: '600',
	},
	tabTextActive: {
		color: colors.accent,
	},
});

export default CompetitionTabs;
