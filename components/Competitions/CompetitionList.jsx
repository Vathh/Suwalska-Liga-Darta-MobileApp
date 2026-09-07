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
import { fetchCompetitionPage } from '../../helpers/competitionsApi';
import { colors } from '../../theme/colors';
import ScreenLoading from '../Common/ScreenLoading';
import { STATUS_STYLES } from './DetailHeader';

/**
 * Wspólna lista katalogu Rozgrywek (organizacji / sezony / turnieje).
 *
 * @param {{
 *   title: string,
 *   emptyTitle: string,
 *   emptyDescription: string,
 *   buildUrl: (page: number) => string,
 *   detailRoute: string,
 *   navigation: object,
 * }} props
 */
const CompetitionList = ({
	title,
	emptyTitle,
	emptyDescription,
	buildUrl,
	detailRoute,
	navigation,
}) => {
	const { auth } = useAuth();
	const [items, setItems] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');

	const loadPage = useCallback(
		async (nextPage, { append, soft } = {}) => {
			if (!auth?.accessToken) {
				setItems([]);
				setHasMore(false);
				setError('Brak autoryzacji.');
				setLoading(false);
				return;
			}

			if (append) {
				setLoadingMore(true);
			} else if (!soft) {
				setLoading(true);
			}

			const result = await fetchCompetitionPage(buildUrl, auth.accessToken, nextPage);

			if (result.error) {
				if (!append) {
					setItems([]);
					setHasMore(false);
				}
				setError(result.error);
			} else {
				setError('');
				setItems((prev) => (append ? [...prev, ...result.items] : result.items));
				setHasMore(result.hasMore);
				setPage(nextPage);
			}

			setLoading(false);
			setLoadingMore(false);
			setRefreshing(false);
		},
		[auth?.accessToken, buildUrl],
	);

	useFocusEffect(
		useCallback(() => {
			setLoading(true);
			void loadPage(1, { append: false });
		}, [loadPage]),
	);

	const onRefresh = () => {
		setRefreshing(true);
		void loadPage(1, { append: false, soft: true });
	};

	const onLoadMore = () => {
		if (loadingMore || !hasMore) return;
		void loadPage(page + 1, { append: true });
	};

	if (loading) {
		return <ScreenLoading />;
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />
			}
		>
			<Text style={styles.heading}>{title}</Text>

			{error ? <Text style={styles.error}>{error}</Text> : null}

			{!error && items.length === 0 ? (
				<View style={styles.empty}>
					<Text style={styles.emptyTitle}>{emptyTitle}</Text>
					<Text style={styles.emptyDescription}>{emptyDescription}</Text>
				</View>
			) : null}

			{items.map((item) => {
				const subtitle = item.subtitle_missing
					? 'Data rozgrywek: nie ustawiono'
					: item.subtitle || null;
				const statusStyle = item.status_variant
					? STATUS_STYLES[item.status_variant] ?? STATUS_STYLES.finished
					: null;

				return (
					<Pressable
						key={item.id}
						style={styles.card}
						onPress={() => {
							if (detailRoute && navigation) {
								navigation.navigate(detailRoute, { id: item.id });
							}
						}}
					>
						<View style={styles.cardHeader}>
							<Text style={styles.cardTitle}>{item.title}</Text>
							{item.status_label && statusStyle ? (
								<View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
									<Text style={[styles.badgeText, { color: statusStyle.text }]}>
										{item.status_label}
									</Text>
								</View>
							) : null}
						</View>
						{subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
					</Pressable>
				);
			})}

			{hasMore ? (
				<Pressable
					style={[styles.loadMore, loadingMore && styles.loadMoreDisabled]}
					onPress={onLoadMore}
					disabled={loadingMore}
				>
					<Text style={styles.loadMoreText}>
						{loadingMore ? 'Ładowanie…' : 'Załaduj więcej'}
					</Text>
				</Pressable>
			) : null}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg,
	},
	content: {
		padding: 24,
		paddingBottom: 40,
	},
	centered: {
		flex: 1,
		backgroundColor: colors.bg,
		justifyContent: 'center',
		alignItems: 'center',
	},
	heading: {
		fontSize: 22,
		fontWeight: '600',
		color: colors.text,
		marginBottom: 20,
	},
	error: {
		color: colors.dangerText,
		marginBottom: 16,
		fontSize: 14,
	},
	empty: {
		paddingVertical: 32,
		alignItems: 'center',
	},
	emptyTitle: {
		fontSize: 17,
		fontWeight: '600',
		color: colors.text,
		marginBottom: 8,
		textAlign: 'center',
	},
	emptyDescription: {
		fontSize: 14,
		color: colors.textMuted,
		textAlign: 'center',
	},
	card: {
		backgroundColor: colors.bgElevated,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		marginBottom: 12,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 10,
	},
	cardTitle: {
		flex: 1,
		fontSize: 16,
		fontWeight: '600',
		color: colors.text,
	},
	cardSubtitle: {
		marginTop: 8,
		fontSize: 13,
		color: colors.textMuted,
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 6,
	},
	badgeText: {
		fontSize: 11,
		fontWeight: '600',
	},
	loadMore: {
		marginTop: 8,
		alignItems: 'center',
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 1.5,
		borderColor: colors.borderStrong,
		backgroundColor: colors.bgElevated,
	},
	loadMoreDisabled: {
		opacity: 0.6,
	},
	loadMoreText: {
		color: colors.text,
		fontSize: 15,
		fontWeight: '600',
	},
});

export default CompetitionList;
