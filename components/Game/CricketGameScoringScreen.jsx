import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useIsFocused } from '@react-navigation/native';
import { Alert, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	CRICKET_APPLY,
	CRICKET_LEG_RESET,
	CRICKET_LEG_WIN,
	CRICKET_RESTORE,
	applyCricketDart,
	cricketReducer,
	findCricketLegWinnerIndex,
	initialCricketState,
} from '../../helpers/cricket';
import { computeNextLegOpener } from '../../helpers/computeNextLegOpener';
import { normalizeMatchFormat } from '../../helpers/matchFormat/matchFormat';
import {
	GAME_MODE,
	resolveGameContext,
} from '../../helpers/gameScoring';
import { saveCompletedTrainingGame } from '../../helpers/trainingHistory/saveCompletedTrainingGame';
import useAuth from '../../hooks/useAuth';
import { useCricketFfaScoring } from '../../hooks/useCricketFfaScoring';
import { useFfaPresenceHeartbeat } from '../../hooks/useFfaPresenceHeartbeat';
import { useGameFinishedModal } from '../../hooks/useGameFinishedModal';
import { useLeaveGameConfirmation } from '../../hooks/useLeaveGameConfirmation';
import CricketCounter from './CricketCounter';
import GameFinishedModal from './GameFinishedModal';
import GameScoringModals from './GameScoringModals';
import { gameScoringScreenStyles as styles } from './GameScoringScreen.styles';
import { colors } from '../../theme/colors';

/**
 * Scoring cricket: trening lokalny albo quick FFA (one_device / each_own) przez API.
 */
export default function CricketGameScoringScreen({ route, navigation }) {
	const { auth } = useAuth();
	const isFocused = useIsFocused();
	const insets = useSafeAreaInsets();
	const gameCtx = useMemo(
		() => resolveGameContext(route.params, auth),
		[route.params, auth],
	);
	const {
		mode,
		players,
		N,
		matchFormat: routeMatchFormat,
		showStartModal,
		isHost,
		syncEnabled,
		transport,
		reloadKey,
		lobbyId,
		lobbyScoringMode,
		myPlayerIndex,
	} = gameCtx;
	const matchFormat = normalizeMatchFormat(routeMatchFormat);
	const legsToWin = matchFormat.legsToWinSet ?? 2;

	const [isModalVisible, setIsModalVisible] = useState(!!showStartModal);
	const [gameClosed, setGameClosed] = useState(false);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [dartsInVisit, setDartsInVisit] = useState(0);
	const legOpenerIndexRef = useRef(0);
	const dartLogRef = useRef([]);
	const matchEndedRef = useRef(false);
	const intentionalFfaLeaveRef = useRef(false);
	const currentPlayerIndexRef = useRef(0);
	currentPlayerIndexRef.current = currentPlayerIndex;

	const [p1, d1] = useReducer(cricketReducer, undefined, initialCricketState);
	const [p2, d2] = useReducer(cricketReducer, undefined, initialCricketState);
	const [p3, d3] = useReducer(cricketReducer, undefined, initialCricketState);
	const [p4, d4] = useReducer(cricketReducer, undefined, initialCricketState);
	const [p5, d5] = useReducer(cricketReducer, undefined, initialCricketState);
	const [p6, d6] = useReducer(cricketReducer, undefined, initialCricketState);
	const [p7, d7] = useReducer(cricketReducer, undefined, initialCricketState);
	const [p8, d8] = useReducer(cricketReducer, undefined, initialCricketState);

	const allStates = [p1, p2, p3, p4, p5, p6, p7, p8];
	const allDispatches = [d1, d2, d3, d4, d5, d6, d7, d8];
	const cricketStates = allStates.slice(0, N);
	const cricketDispatches = allDispatches.slice(0, N);
	const cricketStatesRef = useRef(cricketStates);
	cricketStatesRef.current = cricketStates;

	const { finishedModalProps, showFinished } = useGameFinishedModal({
		navigation,
		mode,
		isHost,
		lobbyId,
		accessToken: auth?.accessToken,
		players,
		matchFormat,
	});

	const onFinishedQuickGameId = useCallback(() => {
		if (matchEndedRef.current) return;
		matchEndedRef.current = true;
		const winnerIdx = cricketStatesRef.current.reduce(
			(best, s, i, arr) =>
				(s?.legsWon ?? 0) > (arr[best]?.legsWon ?? 0) ? i : best,
			0,
		);
		const name = players[winnerIdx]?.name ?? 'Zwycięzca';
		showFinished({ winnerName: name, kind: 'quick' });
	}, [players, showFinished]);

	const {
		busy,
		canInputFromServer,
		submitHit,
		submitMiss,
		submitUndo,
	} = useCricketFfaScoring({
		enabled: syncEnabled && !!transport,
		transport,
		N,
		cricketDispatches,
		setCurrentPlayerIndex,
		setDartsInVisit,
		setGameClosed,
		legOpenerIndexRef,
		onFinishedQuickGameId,
		reloadKey,
	});

	useLeaveGameConfirmation({
		navigation,
		mode,
		gameClosed,
		tournamentGame: null,
		accessToken: auth?.accessToken,
		syncEnabled,
		lobbyId,
		intentionalFfaLeaveRef,
	});

	useFfaPresenceHeartbeat({
		mode,
		syncEnabled,
		lobbyId,
		accessToken: auth?.accessToken,
		gameClosed,
		intentionalFfaLeaveRef,
	});

	useEffect(() => {
		if (isFocused) {
			activateKeepAwakeAsync('cricket-scoring').catch(() => {});
		} else {
			deactivateKeepAwake('cricket-scoring');
		}
		return () => deactivateKeepAwake('cricket-scoring');
	}, [isFocused]);

	const finishMatchLocal = useCallback(
		(winnerIndex, winnerLegsWon) => {
			if (matchEndedRef.current) return;
			matchEndedRef.current = true;
			setGameClosed(true);
			const name = players[winnerIndex]?.name ?? 'Zwycięzca';
			if (mode === GAME_MODE.TRAINING) {
				const states = cricketStatesRef.current.map((s, i) => ({
					...s,
					legsWon:
						i === winnerIndex
							? (winnerLegsWon ?? (s?.legsWon ?? 0) + 1)
							: (s?.legsWon ?? 0),
				}));
				void saveCompletedTrainingGame({
					players,
					matchFormat,
					gameType: 'cricket',
					cricketStates: states,
					accessToken: auth?.accessToken,
				});
				showFinished({ winnerName: name, kind: 'training' });
			} else {
				showFinished({ winnerName: name, kind: 'quick' });
			}
		},
		[mode, players, matchFormat, showFinished],
	);

	const closeLegLocal = useCallback(
		(winnerIndex) => {
			cricketDispatches[winnerIndex]({ type: CRICKET_LEG_WIN });
			const nextLegs = (cricketStatesRef.current[winnerIndex]?.legsWon ?? 0) + 1;
			if (nextLegs >= legsToWin) {
				for (let i = 0; i < N; i += 1) {
					cricketDispatches[i]({ type: CRICKET_LEG_RESET });
				}
				dartLogRef.current = [];
				setDartsInVisit(0);
				finishMatchLocal(winnerIndex, nextLegs);
				return;
			}

			for (let i = 0; i < N; i += 1) {
				cricketDispatches[i]({ type: CRICKET_LEG_RESET });
			}
			dartLogRef.current = [];
			setDartsInVisit(0);
			const nextOpener = computeNextLegOpener(legOpenerIndexRef.current, N);
			legOpenerIndexRef.current = nextOpener;
			setCurrentPlayerIndex(nextOpener);
			Alert.alert(
				'Leg zakończony',
				`${players[winnerIndex]?.name ?? 'Gracz'} wygrywa lega.`,
				[{ text: 'OK' }],
			);
		},
		[N, cricketDispatches, finishMatchLocal, legsToWin, players],
	);

	const advanceAfterDartLocal = useCallback(
		(statesAfter) => {
			const winnerIdx = findCricketLegWinnerIndex(statesAfter);
			if (winnerIdx != null) {
				closeLegLocal(winnerIdx);
				return;
			}
			setDartsInVisit((prev) => {
				const next = prev + 1;
				if (next >= 3) {
					setCurrentPlayerIndex((idx) => (idx + 1) % N);
					return 0;
				}
				return next;
			});
		},
		[N, closeLegLocal],
	);

	const isSpectator =
		syncEnabled && lobbyScoringMode === 'one_device' && !isHost;

	const canInput =
		!gameClosed &&
		!isModalVisible &&
		!busy &&
		!isSpectator &&
		(!syncEnabled || canInputFromServer) &&
		(!syncEnabled
			|| lobbyScoringMode !== 'each_own'
			|| myPlayerIndex === null
			|| myPlayerIndex === currentPlayerIndex);

	const handleCricketHit = (segment, multiplier) => {
		if (!canInput) return;
		if (syncEnabled && transport) {
			if (!transport.assertCanInput?.(currentPlayerIndex)) return;
			const playerId = players[currentPlayerIndex]?.playerId;
			if (playerId == null) {
				Alert.alert('Błąd', 'Brak playerId gracza.');
				return;
			}
			submitHit(playerId, segment, multiplier);
			return;
		}

		const idx = currentPlayerIndex;
		const states = cricketStatesRef.current;
		const hitsList = states.map((s) => ({ ...s.hits }));
		const { hits, pointsScored } = applyCricketDart(
			hitsList,
			idx,
			segment,
			multiplier,
		);
		const pointsBefore = states[idx].points;
		dartLogRef.current.push({
			playerIndex: idx,
			kind: 'hit',
			hitsBefore: { ...states[idx].hits },
			pointsBefore,
			dartsInVisitBefore: dartsInVisit,
		});
		cricketDispatches[idx]({
			type: CRICKET_APPLY,
			hits,
			points: pointsBefore + pointsScored,
		});
		const statesAfter = states.map((s, i) =>
			i === idx
				? { ...s, hits, points: pointsBefore + pointsScored }
				: s,
		);
		advanceAfterDartLocal(statesAfter);
	};

	const handleCricketMiss = () => {
		if (!canInput) return;
		if (syncEnabled && transport) {
			if (!transport.assertCanInput?.(currentPlayerIndex)) return;
			const playerId = players[currentPlayerIndex]?.playerId;
			if (playerId == null) {
				Alert.alert('Błąd', 'Brak playerId gracza.');
				return;
			}
			submitMiss(playerId);
			return;
		}

		dartLogRef.current.push({
			playerIndex: currentPlayerIndex,
			kind: 'miss',
			dartsInVisitBefore: dartsInVisit,
		});
		advanceAfterDartLocal(cricketStatesRef.current);
	};

	const handleCricketUndo = () => {
		if (gameClosed || isModalVisible || busy || isSpectator) return;
		if (syncEnabled && transport) {
			if (!transport.assertCanUndo?.()) return;
			submitUndo();
			return;
		}
		const log = dartLogRef.current;
		if (log.length === 0) return;
		const last = log.pop();
		setCurrentPlayerIndex(last.playerIndex);
		setDartsInVisit(last.dartsInVisitBefore);
		if (last.kind === 'hit') {
			cricketDispatches[last.playerIndex]({
				type: CRICKET_RESTORE,
				hits: last.hitsBefore,
				points: last.pointsBefore,
			});
		}
	};

	const handleBullWinnerSelection = (player) => {
		const idx = players.findIndex(
			(p) => p === player || p?.id === player?.id || p?.name === player?.name,
		);
		const opener = idx >= 0 ? idx : 0;
		legOpenerIndexRef.current = opener;
		setCurrentPlayerIndex(opener);
		setIsModalVisible(false);
	};

	return (
		<View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
			<GameScoringModals
				isOpenerModalVisible={isModalVisible}
				players={players}
				playerCount={N}
				onSelectOpener={handleBullWinnerSelection}
				checkoutModalPlayer={null}
				isCheckoutModalVisible={false}
				onCheckoutDart={() => {}}
				scoringBusy={busy}
				scoringBusyLabel="Zapisywanie rzutu…"
			/>

			<GameFinishedModal {...finishedModalProps} />

			<View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
				<Text style={{ color: colors.textDim, textAlign: 'center', fontSize: 13 }}>
					Cricket · do {legsToWin} {legsToWin === 1 ? 'lega' : 'legów'}
					{syncEnabled
						? ` · ${lobbyScoringMode === 'each_own' ? 'online' : '1 urządzenie'}`
						: ''}
					{gameClosed ? ' · koniec' : ''}
				</Text>
			</View>

			{isSpectator && (
				<View style={{ padding: 16 }}>
					<Text style={{ color: colors.textMuted, textAlign: 'center' }}>
						Tryb jednego urządzenia — wynik wpisuje host. Widzisz stan na żywo.
					</Text>
				</View>
			)}

			<CricketCounter
				players={players}
				cricketStates={cricketStates}
				currentPlayerIndex={currentPlayerIndex}
				dartsInVisit={dartsInVisit}
				onCricketHit={handleCricketHit}
				onCricketMiss={handleCricketMiss}
				onCricketUndo={handleCricketUndo}
				gameClosed={gameClosed || isSpectator || (syncEnabled && !canInput)}
			/>
		</View>
	);
}
