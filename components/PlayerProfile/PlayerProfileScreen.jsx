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
import { fetchPlayerProfile } from '../../helpers/playerProfileApi';
import ProfileHeader from './ProfileHeader';
import ProfileFriendshipActions from './ProfileFriendshipActions';
import ProfileStatsOverview from './ProfileStatsOverview';
import ProfileGameHistory from './ProfileGameHistory';
import { colors } from '../../theme/colors';
import ScreenLoading from '../Common/ScreenLoading';

const TAB_OVERVIEW = 'overview';
const TAB_HISTORY = 'history';

const PlayerProfileScreen = ({ navigation, route }) => {
	const { auth } = useAuth();
	const playerId = route?.params?.playerId;
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [activeTab, setActiveTab] = useState(TAB_OVERVIEW);

	const loadProfile = useCallback(async () => {
		if (!playerId || !auth?.accessToken) {
			setError('Brak danych gracza.');
			setLoading(false);
			setRefreshing(false);
			return;
		}

		const result = await fetchPlayerProfile(playerId, auth.accessToken);
		if (!result.ok) {
			setProfile(null);
			setError(result.message || 'Nie udało się wczytać profilu.');
		} else {
			setProfile(result.data);
			setError('');
		}
		setLoading(false);
		setRefreshing(false);
	}, [playerId, auth?.accessToken]);

	useFocusEffect(
		useCallback(() => {
			setLoading(true);
			loadProfile();
		}, [loadProfile]),
	);

	const onRefresh = () => {
		setRefreshing(true);
		loadProfile();
	};

	if (loading) {
		return <ScreenLoading />;
	}

	if (error && !profile) {
		return (
			<View style={styles.centered}>
				<Text style={styles.error}>{error}</Text>
				<Pressable style={styles.retry} onPress={() => { setLoading(true); loadProfile(); }}>
					<Text style={styles.retryText}>Spróbuj ponownie</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />
			}
		>
			<ProfileHeader
				name={profile?.player?.name}
				registeredAt={profile?.player?.registeredAt}
				description={profile?.player?.description}
				isSelf={!!profile?.friendship?.isSelf}
				onEditPress={() =>
					navigation.navigate('EditPlayerProfile', {
						playerId,
						description: profile?.player?.description ?? '',
					})
				}
			/>
			<ProfileFriendshipActions
				friendship={profile?.friendship}
				userId={profile?.player?.userId}
				accessToken={auth?.accessToken}
				onChanged={loadProfile}
			/>

			<View style={styles.tabs}>
				<Pressable
					style={[styles.tab, activeTab === TAB_OVERVIEW && styles.tabActive]}
					onPress={() => setActiveTab(TAB_OVERVIEW)}
				>
					<Text style={[styles.tabText, activeTab === TAB_OVERVIEW && styles.tabTextActive]}>
						Przegląd
					</Text>
				</Pressable>
				<Pressable
					style={[styles.tab, activeTab === TAB_HISTORY && styles.tabActive]}
					onPress={() => setActiveTab(TAB_HISTORY)}
				>
					<Text style={[styles.tabText, activeTab === TAB_HISTORY && styles.tabTextActive]}>
						Historia meczów
					</Text>
				</Pressable>
			</View>

			{activeTab === TAB_OVERVIEW ? (
				<ProfileStatsOverview
					quickStats={profile?.quickStats}
					tournamentStats={profile?.tournamentStats}
				/>
			) : (
				<ProfileGameHistory
					key={`${playerId}-${profile?.gameHistory?.items?.length ?? 0}`}
					playerId={playerId}
					accessToken={auth?.accessToken}
					initialItems={profile?.gameHistory?.items}
					initialHasMore={profile?.gameHistory?.hasMore}
				/>
			)}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg,
	},
	content: {
		padding: 16,
		paddingBottom: 32,
	},
	centered: {
		flex: 1,
		backgroundColor: colors.bg,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	error: {
		color: colors.dangerText,
		textAlign: 'center',
		marginBottom: 16,
	},
	retry: {
		backgroundColor: colors.accent,
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	retryText: {
		color: colors.onAccent,
		fontWeight: '600',
	},
	tabs: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
		paddingBottom: 8,
	},
	tab: {
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.border,
	},
	tabActive: {
		backgroundColor: colors.successMuted,
		borderColor: colors.border,
	},
	tabText: {
		color: colors.textSecondary,
		fontWeight: '600',
	},
	tabTextActive: {
		color: colors.successSoftText,
	},
});

export default PlayerProfileScreen;
