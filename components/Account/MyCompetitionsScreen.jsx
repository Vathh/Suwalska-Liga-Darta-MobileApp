import React, { useCallback, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { fetchMyCompetitions } from '../../helpers/myCompetitionsApi';
import { colors } from '../../theme/colors';

function formatSeasonMeta(item) {
	const parts = [];
	if (item.organizationName) {
		parts.push(item.organizationName);
	}
	if (item.startDate && item.endDate) {
		parts.push(`${item.startDate} – ${item.endDate}`);
	}
	return parts.join(' · ');
}

function formatLeagueMeta(item) {
	const parts = [];
	if (item.organizationName) {
		parts.push(item.organizationName);
	}
	if (item.divisionName) {
		parts.push(item.divisionName);
	}
	return parts.join(' · ');
}

const Section = ({ title, emptyText, items, onPress, subtitle }) => (
	<View style={styles.section}>
		<Text style={styles.sectionTitle}>{title}</Text>
		{items.length === 0 ? (
			<Text style={styles.empty}>{emptyText}</Text>
		) : (
			items.map((item) => (
				<Pressable
					key={`${title}-${item.id}`}
					style={styles.card}
					onPress={() => onPress(item)}
				>
					<View style={styles.cardHeader}>
						<Text style={styles.cardTitle}>{item.name}</Text>
						<Text
							style={[
								styles.role,
								item.role === 'admin' ? styles.roleAdmin : styles.roleMember,
							]}
						>
							{item.roleLabel}
						</Text>
					</View>
					{subtitle(item) ? (
						<Text style={styles.cardSub}>{subtitle(item)}</Text>
					) : null}
				</Pressable>
			))
		)}
	</View>
);

/** Sezony turniejowe, ligi i organizacje, z którymi użytkownik jest powiązany. */
const MyCompetitionsScreen = ({ navigation }) => {
	const { auth } = useAuth();
	const [seasons, setSeasons] = useState([]);
	const [leagues, setLeagues] = useState([]);
	const [organizations, setOrganizations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');

	const load = useCallback(
		async ({ soft } = {}) => {
			if (!auth?.accessToken) {
				setError('Brak autoryzacji.');
				setLoading(false);
				return;
			}
			if (!soft) {
				setLoading(true);
			}

			const result = await fetchMyCompetitions(auth.accessToken);
			if (!result.ok) {
				if (!soft) {
					setSeasons([]);
					setLeagues([]);
					setOrganizations([]);
				}
				setError(result.message);
			} else {
				setError('');
				setSeasons(result.data.seasons);
				setLeagues(result.data.leagues);
				setOrganizations(result.data.organizations);
			}

			setLoading(false);
			setRefreshing(false);
		},
		[auth?.accessToken],
	);

	useFocusEffect(
		useCallback(() => {
			void load();
		}, [load]),
	);

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color={colors.accent} />
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={() => {
						setRefreshing(true);
						void load({ soft: true });
					}}
					colors={[colors.accent]}
				/>
			}
		>
			<Text style={styles.lead}>
				Trwające sezony turniejowe, ligi i organizacje, w których jesteś w składzie, grasz albo którymi zarządzasz.
			</Text>
			{error ? <Text style={styles.error}>{error}</Text> : null}

			<Section
				title="Sezony"
				emptyText="Nie jesteś powiązany z żadnym trwającym sezonem turniejowym."
				items={seasons}
				subtitle={formatSeasonMeta}
				onPress={(item) => navigation.navigate('SeasonDetail', { id: item.id })}
			/>
			<Section
				title="Ligi"
				emptyText="Nie jesteś w żadnej lidze piramidowej."
				items={leagues}
				subtitle={formatLeagueMeta}
				onPress={(item) => navigation.navigate('LeagueDetail', { id: item.id })}
			/>
			<Section
				title="Organizacje"
				emptyText="Nie jesteś powiązany z żadną organizacją."
				items={organizations}
				subtitle={(item) => item.description || 'Organizacja'}
				onPress={(item) => navigation.navigate('OrganizationDetail', { id: item.id })}
			/>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.bg },
	content: { padding: 24, paddingBottom: 40 },
	centered: {
		flex: 1,
		backgroundColor: colors.bg,
		justifyContent: 'center',
		alignItems: 'center',
	},
	lead: {
		color: colors.textMuted,
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 20,
	},
	error: { color: colors.dangerText, marginBottom: 16, fontSize: 14 },
	section: { marginBottom: 28 },
	sectionTitle: {
		marginBottom: 12,
		fontSize: 16,
		fontWeight: '700',
		color: colors.text,
	},
	empty: { color: colors.textMuted, fontSize: 14 },
	card: {
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: colors.bgElevated,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 10,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 10,
	},
	cardTitle: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
	cardSub: { marginTop: 6, color: colors.textMuted, fontSize: 13 },
	role: { fontSize: 12, fontWeight: '700' },
	roleAdmin: { color: colors.accent },
	roleMember: { color: colors.textMuted },
});

export default MyCompetitionsScreen;
