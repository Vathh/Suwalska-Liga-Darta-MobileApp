import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import ProfileGameHistoryItem from './ProfileGameHistoryItem';
import { fetchPlayerGames } from '../../helpers/playerProfileApi';
import { colors } from '../../theme/colors';

const ProfileGameHistory = ({ playerId, accessToken, initialItems, initialHasMore }) => {
	const [items, setItems] = useState(Array.isArray(initialItems) ? initialItems : []);
	const [hasMore, setHasMore] = useState(Boolean(initialHasMore));
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const loadMore = async () => {
		if (loading || !hasMore) return;
		setLoading(true);
		setError('');
		const nextPage = page + 1;
		const result = await fetchPlayerGames(playerId, accessToken, nextPage);
		if (!result.ok) {
			setError(result.message || 'Nie udało się wczytać historii.');
			setLoading(false);
			return;
		}
		const nextItems = Array.isArray(result.data?.items) ? result.data.items : [];
		setItems((prev) => [...prev, ...nextItems]);
		setHasMore(Boolean(result.data?.has_more));
		setPage(nextPage);
		setLoading(false);
	};

	return (
		<View style={styles.wrap}>
			<Text style={styles.sectionTitle}>Ostatnie mecze</Text>
			{items.length === 0 ? (
				<Text style={styles.empty}>Brak meczów w historii.</Text>
			) : (
				items.map((item, index) => (
					<ProfileGameHistoryItem
						key={`${item?.type || 'g'}-${item?.id || index}-${item?.date || index}`}
						item={item}
					/>
				))
			)}
			{error ? <Text style={styles.error}>{error}</Text> : null}
			{hasMore ? (
				<Pressable
					style={[styles.loadMore, loading && styles.disabled]}
					onPress={loadMore}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color={colors.onAccent} />
					) : (
						<Text style={styles.loadMoreText}>Załaduj więcej</Text>
					)}
				</Pressable>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: {
		paddingBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: colors.accent,
		marginBottom: 12,
	},
	empty: {
		color: colors.textMuted,
		textAlign: 'center',
		paddingVertical: 24,
	},
	error: {
		color: colors.dangerText,
		marginBottom: 8,
		textAlign: 'center',
	},
	loadMore: {
		marginTop: 8,
		alignSelf: 'center',
		backgroundColor: colors.accent,
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 20,
		minWidth: 160,
		alignItems: 'center',
	},
	loadMoreText: {
		color: colors.onAccent,
		fontWeight: '600',
	},
	disabled: {
		opacity: 0.7,
	},
});

export default ProfileGameHistory;
