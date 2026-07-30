import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuth from '../hooks/useAuth';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import GameList from '../components/Game/GameList';
import GameScoringScreen from '../components/Game/GameScoringScreen';
import TournamentLogin from '../components/Tournament/TournamentLogin';
import AccountRegister from '../components/Tournament/AccountRegister';
import TournamentCode from '../components/Tournament/TournamentCode';
import JoinTournamentScreen from '../components/Tournament/JoinTournamentScreen';
import Home from '../components/Core/Home';
import HomeDashboard from '../components/Core/HomeDashboard';
import QuickGameLobby from '../components/QuickGame/QuickGameLobby';
import TrainingMatchSetup from '../components/QuickGame/TrainingMatchSetup';
import FriendsScreen from '../components/Friends/FriendsScreen';
import InvitationsScreen from '../components/Invitations/InvitationsScreen';
import PlayerProfileScreen from '../components/PlayerProfile/PlayerProfileScreen';
import AccountScreen from '../components/Account/AccountScreen';
import CompetitionsScreen from '../components/Competitions/CompetitionsScreen';
import LeaguesListScreen from '../components/Competitions/LeaguesListScreen';
import SeasonsListScreen from '../components/Competitions/SeasonsListScreen';
import TournamentsListScreen from '../components/Competitions/TournamentsListScreen';
import LeagueDetailScreen from '../components/Competitions/LeagueDetailScreen';
import SeasonDetailScreen from '../components/Competitions/SeasonDetailScreen';
import TournamentDetailScreen from '../components/Competitions/TournamentDetailScreen';
import HeaderTitle from '../components/Common/HeaderTitle';
import AccountMenuButton from '../components/Common/AccountMenuButton';
import LogoutButton from '../components/Common/LogoutButton';
import LoginButton from '../components/Common/LoginButton';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerOptions = {
	headerStyle: { backgroundColor: colors.bg },
	headerTintColor: colors.accent,
	headerTitleAlign: 'left',
};

function tabIcon(name) {
	return ({ color, size }) => <Ionicons name={name} size={size} color={color} />;
}

/** Dolny pasek: Graj / Rozgrywki / Znajomi / Zaproszenia / Konto (+ ukryty Home). */
function UserMainTabs() {
	const insets = useSafeAreaInsets();
	return (
		<Tab.Navigator
			initialRouteName="Home"
			screenOptions={{
				...headerOptions,
				headerTitle: (props) => <HeaderTitle {...props} />,
				headerRight: () => <AccountMenuButton />,
				tabBarStyle: {
					backgroundColor: colors.bg,
					borderTopColor: colors.border,
					borderTopWidth: 1,
				},
				tabBarSafeAreaInsets: { bottom: insets.bottom + 6 },
				tabBarActiveTintColor: colors.accent,
				tabBarInactiveTintColor: colors.textMuted,
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: '600',
				},
			}}
		>
			<Tab.Screen
				name="Home"
				component={HomeDashboard}
				options={{
					tabBarButton: () => null,
				}}
			/>
			<Tab.Screen
				name="Graj"
				component={Home}
				options={{
					tabBarLabel: 'Graj',
					tabBarIcon: tabIcon('play-circle-outline'),
				}}
			/>
			<Tab.Screen
				name="Rozgrywki"
				component={CompetitionsScreen}
				options={{
					tabBarLabel: 'Rozgrywki',
					tabBarIcon: tabIcon('trophy-outline'),
				}}
			/>
			<Tab.Screen
				name="Znajomi"
				component={FriendsScreen}
				options={{
					tabBarLabel: 'Znajomi',
					tabBarIcon: tabIcon('people-outline'),
				}}
			/>
			<Tab.Screen
				name="Zaproszenia"
				component={InvitationsScreen}
				options={{
					tabBarLabel: 'Zaproszenia',
					tabBarIcon: tabIcon('mail-outline'),
				}}
			/>
			<Tab.Screen
				name="Konto"
				component={AccountScreen}
				options={{
					tabBarLabel: 'Konto',
					tabBarIcon: tabIcon('person-outline'),
				}}
			/>
		</Tab.Navigator>
	);
}

const Screens = () => {
	const { auth, authLoading } = useAuth();
	const insets = useSafeAreaInsets();
	const bottomPad = Math.max(insets.bottom, 10);
	const paddedContent = { backgroundColor: colors.bg, paddingBottom: bottomPad };

	if (authLoading) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color={colors.accent} />
			</View>
		);
	}

	// Niezalogowany: Home = widok gry (bez dolnego paska)
	if (!auth?.accessToken) {
		return (
			<Stack.Navigator
				key="guest"
				initialRouteName="Home"
				screenOptions={{ contentStyle: paddedContent }}
			>
				<Stack.Screen
					name="Home"
					component={Home}
					options={{
						...headerOptions,
						headerTitle: (props) => <HeaderTitle {...props} />,
						headerRight: () => <LoginButton />,
					}}
				/>
				<Stack.Screen
					name="AccountLogin"
					component={TournamentLogin}
					options={{ ...headerOptions, headerTitle: (props) => <HeaderTitle {...props} /> }}
				/>
				<Stack.Screen
					name="AccountRegister"
					component={AccountRegister}
					options={{ ...headerOptions, headerTitle: (props) => <HeaderTitle {...props} /> }}
				/>
				<Stack.Screen
					name="TournamentCode"
					component={TournamentCode}
					options={{ ...headerOptions, headerTitle: (props) => <HeaderTitle {...props} /> }}
				/>
				<Stack.Screen
					name="JoinTournament"
					component={JoinTournamentScreen}
					options={{ ...headerOptions, headerTitle: (props) => <HeaderTitle {...props} /> }}
				/>
				<Stack.Screen
					name="QuickGameLobby"
					component={QuickGameLobby}
					options={{
						...headerOptions,
						headerTitle: (props) => <HeaderTitle {...props} />,
						headerRight: () => <LoginButton />,
					}}
				/>
				<Stack.Screen
					name="TrainingMatchSetup"
					component={TrainingMatchSetup}
					options={{ ...headerOptions, headerTitle: (props) => <HeaderTitle {...props} /> }}
				/>
				<Stack.Screen
					name="GameScoring"
					component={GameScoringScreen}
					options={{ ...headerOptions, headerTitle: (props) => <HeaderTitle {...props} /> }}
				/>
			</Stack.Navigator>
		);
	}

	// Zalogowany na konto: taby + stack na flow (lobby, scoring, …)
	if (auth?.accessToken && !auth?.tournamentId) {
		const flowOptions = {
			...headerOptions,
			headerTitle: (props) => <HeaderTitle {...props} />,
			headerRight: () => <AccountMenuButton />,
			contentStyle: paddedContent,
		};
		return (
			<Stack.Navigator key="user" initialRouteName="MainTabs">
				<Stack.Screen
					name="MainTabs"
					component={UserMainTabs}
					options={{ headerShown: false }}
				/>
				<Stack.Screen name="QuickGameLobby" component={QuickGameLobby} options={flowOptions} />
				<Stack.Screen name="TrainingMatchSetup" component={TrainingMatchSetup} options={flowOptions} />
				<Stack.Screen name="GameScoring" component={GameScoringScreen} options={flowOptions} />
				<Stack.Screen name="TournamentCode" component={TournamentCode} options={flowOptions} />
				<Stack.Screen name="JoinTournament" component={JoinTournamentScreen} options={flowOptions} />
				<Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} options={flowOptions} />
				<Stack.Screen name="LeaguesList" component={LeaguesListScreen} options={flowOptions} />
				<Stack.Screen name="SeasonsList" component={SeasonsListScreen} options={flowOptions} />
				<Stack.Screen name="TournamentsList" component={TournamentsListScreen} options={flowOptions} />
				<Stack.Screen name="LeagueDetail" component={LeagueDetailScreen} options={flowOptions} />
				<Stack.Screen name="SeasonDetail" component={SeasonDetailScreen} options={flowOptions} />
				<Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} options={flowOptions} />
			</Stack.Navigator>
		);
	}

	// Zalogowany kodem turnieju: tylko lista meczów i rozgrywka (widok turniejowy)
	return (
		<Stack.Navigator
			key="tournament"
			initialRouteName="GameList"
			screenOptions={{ contentStyle: paddedContent }}
		>
			<Stack.Screen
				name="GameList"
				component={GameList}
				options={{
					...headerOptions,
					headerTitle: (props) => <HeaderTitle {...props} />,
					headerRight: () => <LogoutButton />,
				}}
			/>
			<Stack.Screen
				name="GameScoring"
				component={GameScoringScreen}
				options={{
					...headerOptions,
					headerTitle: (props) => <HeaderTitle {...props} />,
					headerRight: () => <LogoutButton />,
				}}
			/>
		</Stack.Navigator>
	);
};

export default Screens;
