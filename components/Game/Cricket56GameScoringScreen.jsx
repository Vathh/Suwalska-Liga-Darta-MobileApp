import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useIsFocused } from '@react-navigation/native';
import { Alert, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	CRICKET56_APPLY,
	CRICKET56_KIND_TIE_RESET,
	CRICKET56_KIND_WIN,
	CRICKET56_LAST_ROUND_INDEX,
	CRICKET56_LEG_RESET,
	CRICKET56_LEG_WIN,
	CRICKET56_RESTORE,
	applyCricket56Visit,
	cricket56AllActiveHaveThrown,
	cricket56Reducer,
	initialCricket56State,
	resolveCricket56AfterCompletedVisit,
} from '../../helpers/cricket56';
import { computeNextLegOpener } from '../../helpers/computeNextLegOpener';
import { normalizeMatchFormat } from '../../helpers/matchFormat/matchFormat';
import {
	GAME_MODE,
	resolveGameContext,
} from '../../helpers/gameScoring';
import { saveCompletedTrainingGame } from '../../helpers/trainingHistory/saveCompletedTrainingGame';
import useAuth from '../../hooks/useAuth';
import { useCricket56FfaScoring } from '../../hooks/useCricket56FfaScoring';
import { useFfaPresenceHeartbeat } from '../../hooks/useFfaPresenceHeartbeat';
import { useGameFinishedModal } from '../../hooks/useGameFinishedModal';
import { useLeaveGameConfirmation } from '../../hooks/useLeaveGameConfirmation';
import Cricket56Counter from './Cricket56Counter';
import GameFinishedModal from './GameFinishedModal';
import GameScoringModals from './GameScoringModals';
import { gameScoringScreenStyles as styles } from './GameScoringScreen.styles';
import { colors } from '../../theme/colors';

export default function Cricket56GameScoringScreen({ route, navigation }) {
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
	const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
	const thrownThisRoundRef = useRef({});
	const legOpenerIndexRef = useRef(0);
	const dartLogRef = useRef([]);
	const matchEndedRef = useRef(false);
	const intentionalFfaLeaveRef = useRef(false);
	const currentPlayerIndexRef = useRef(0);
	currentPlayerIndexRef.current = currentPlayerIndex;

	const [p1, d1] = useReducer(cricket56Reducer, undefined, initialCricket56State);
	const [p2, d2] = useReducer(cricket56Reducer, undefined, initialCricket56State);
	const [p3, d3] = useReducer(cricket56Reducer, undefined, initialCricket56State);
	const [p4, d4] = useReducer(cricket56Reducer, undefined, initialCricket56State);
	const [p5, d5] = useReducer(cricket56Reducer, undefined, initialCricket56State);
	const [p6, d6] = useReducer(cricket56Reducer, undefined, initialCricket56State);
	const [p7, d7] = useReducer(cricket56Reducer, undefined, initialCricket56State);
	const [p8, d8] = useReducer(cricket56Reducer, undefined, initialCricket56State);

	const allStates = [p1, p2, p3, p4, p5, p6, p7, p8];
	const allDispatches = [d1, d2, d3, d4, d5, d6, d7, d8];
	const cricket56States = allStates.slice(0, N);
	const cricket56Dispatches = allDispatches.slice(0, N);
	const cricket56StatesRef = useRef(cricket56States);
	cricket56StatesRef.current = cricket56States;

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
		const winnerIdx = cricket56StatesRef.current.reduce(
			(best, s, i, arr) =>
				(s?.legsWon ?? 0) > (arr[best]?.legsWon ?? 0) ? i : best,
			0,
		);
		showFinished({
			winnerName: players[winnerIdx]?.name ?? 'Zwycięzca',
			kind: 'quick',
		});
	}, [players, showFinished]);

	const {
		busy,
		canInputFromServer,
		submitVisit,
		submitUndo,
	} = useCricket56FfaScoring({
		enabled: syncEnabled && !!transport,
		transport,
		N,
		cricket56Dispatches,
		setCurrentPlayerIndex,
		setCurrentRoundIndex,
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
			activateKeepAwakeAsync('cricket56-scoring').catch(() => {});
		} else {
			deactivateKeepAwake('cricket56-scoring');
		}
		return () => deactivateKeepAwake('cricket56-scoring');
	}, [isFocused]);

	const nextActiveIndex = useCallback(
		(fromIndex) => (fromIndex + 1) % N,
		[N],
	);

	const resetBoardsLocal = useCallback(() => {
		for (let i = 0; i < N; i += 1) {
			cricket56Dispatches[i]({ type: CRICKET56_LEG_RESET });
		}
		thrownThisRoundRef.current = {};
		setCurrentRoundIndex(0);
	}, [N, cricket56Dispatches]);

	const finishMatchLocal = useCallback(
		(winnerIndex, winnerLegsWon, eventLog = []) => {
			if (matchEndedRef.current) return;
			matchEndedRef.current = true;
			setGameClosed(true);
			const name = players[winnerIndex]?.name ?? 'Zwycięzca';
			if (mode === GAME_MODE.TRAINING) {
				const states = cricket56StatesRef.current.map((s, i) => ({
					...s,
					legsWon:
						i === winnerIndex
							? (winnerLegsWon ?? (s?.legsWon ?? 0) + 1)
							: (s?.legsWon ?? 0),
				}));
				const selfIdx = players.findIndex((p) => p?.isSelf);
				void saveCompletedTrainingGame({
					players,
					matchFormat,
					gameType: 'cricket56',
					cricket56States: states,
					accessToken: auth?.accessToken,
					eventLog,
					selfExtras: {
						score: states[selfIdx]?.score,
						board: { score: states[selfIdx]?.score ?? 0 },
						won: selfIdx === winnerIndex,
					},
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
			cricket56Dispatches[winnerIndex]({ type: CRICKET56_LEG_WIN });
			const nextLegs = (cricket56StatesRef.current[winnerIndex]?.legsWon ?? 0) + 1;
			if (nextLegs >= legsToWin) {
				const eventLog = [...dartLogRef.current];
				resetBoardsLocal();
				dartLogRef.current = [];
				finishMatchLocal(winnerIndex, nextLegs, eventLog);
				return;
			}
			resetBoardsLocal();
			dartLogRef.current = [];
			const nextOpener = computeNextLegOpener(legOpenerIndexRef.current, N);
			legOpenerIndexRef.current = nextOpener;
			setCurrentPlayerIndex(nextOpener);
			Alert.alert(
				'Leg zakończony',
				`${players[winnerIndex]?.name ?? 'Gracz'} wygrywa lega.`,
				[{ text: 'OK' }],
			);
		},
		[N, cricket56Dispatches, finishMatchLocal, legsToWin, players, resetBoardsLocal],
	);

	const advanceAfterVisitLocal = useCallback(
		(statesAfter, playerIndex) => {
			const thrown = { ...thrownThisRoundRef.current, [playerIndex]: true };
			thrownThisRoundRef.current = thrown;
			const outcome = resolveCricket56AfterCompletedVisit(
				statesAfter,
				currentRoundIndex,
				thrown,
			);

			if (outcome.kind === CRICKET56_KIND_WIN) {
				closeLegLocal(outcome.winnerIndex);
				return;
			}
			if (outcome.kind === CRICKET56_KIND_TIE_RESET) {
				resetBoardsLocal();
				setCurrentPlayerIndex(legOpenerIndexRef.current);
				Alert.alert('Remis', 'Ten sam wynik po 7 rundach — runda od nowa.', [
					{ text: 'OK' },
				]);
				return;
			}

			if (
				cricket56AllActiveHaveThrown(statesAfter, thrown)
				&& currentRoundIndex < CRICKET56_LAST_ROUND_INDEX
			) {
				setCurrentRoundIndex((idx) => idx + 1);
				thrownThisRoundRef.current = {};
			}

			setCurrentPlayerIndex((idx) => nextActiveIndex(idx));
		},
		[closeLegLocal, currentRoundIndex, nextActiveIndex, resetBoardsLocal],
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

	const handleVisit = (marksOrPoints) => {
		if (!canInput) return;
		const marks = Array.isArray(marksOrPoints)
			? marksOrPoints.map((m) => Number(m) || 0)
			: null;
		const parsed = marks
			? marks.reduce((sum, m) => sum + m, 0)
			: Number(marksOrPoints);
		if (!Number.isInteger(parsed)) return;
		if (syncEnabled && transport) {
			if (!transport.assertCanInput?.(currentPlayerIndex)) return;
			const playerId = players[currentPlayerIndex]?.playerId;
			if (playerId == null) {
				Alert.alert('Błąd', 'Brak playerId gracza.');
				return;
			}
			submitVisit(playerId, parsed, marks);
			return;
		}

		const idx = currentPlayerIndex;
		const states = cricket56StatesRef.current;
		dartLogRef.current.push({
			playerIndex: idx,
			playerId: players[idx]?.accountPlayerId ?? players[idx]?.playerId ?? idx,
			kind: 'visit',
			points: parsed,
			marks,
			currentRoundIndex: currentRoundIndex,
			scoreBefore: states[idx].score,
			roundIndexBefore: currentRoundIndex,
			thrownBefore: { ...thrownThisRoundRef.current },
		});

		const scoreAfter = applyCricket56Visit(states[idx].score, parsed, currentRoundIndex);
		cricket56Dispatches[idx]({
			type: CRICKET56_APPLY,
			score: scoreAfter,
		});
		const statesAfter = states.map((s, i) =>
			i === idx ? { ...s, score: scoreAfter } : s,
		);
		advanceAfterVisitLocal(statesAfter, idx);
	};

	const handleUndo = () => {
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
		setCurrentRoundIndex(last.roundIndexBefore);
		thrownThisRoundRef.current = last.thrownBefore ?? {};
		cricket56Dispatches[last.playerIndex]({
			type: CRICKET56_RESTORE,
			score: last.scoreBefore,
		});
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
				scoringBusyLabel="Zapisywanie wizyty…"
			/>

			<GameFinishedModal {...finishedModalProps} />

			<View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
				<Text style={{ color: colors.textDim, textAlign: 'center', fontSize: 13 }}>
					Cricket 60 · do {legsToWin} {legsToWin === 1 ? 'lega' : 'legów'}
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

			<Cricket56Counter
				players={players}
				cricket56States={cricket56States}
				currentPlayerIndex={currentPlayerIndex}
				currentRoundIndex={currentRoundIndex}
				onVisit={handleVisit}
				onUndo={handleUndo}
				gameClosed={gameClosed || isSpectator || (syncEnabled && !canInput)}
			/>
		</View>
	);
}
