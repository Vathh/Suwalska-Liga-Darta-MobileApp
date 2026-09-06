import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useIsFocused } from '@react-navigation/native';
import { Alert, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	ATC_APPLY,
	ATC_LEG_RESET,
	ATC_LEG_WIN,
	ATC_RESTORE,
	applyAtcVisit,
	atcReducer,
	clampAtcHits,
	initialAtcState,
} from '../../helpers/atc';
import { computeNextLegOpener } from '../../helpers/computeNextLegOpener';
import { normalizeMatchFormat } from '../../helpers/matchFormat/matchFormat';
import {
	GAME_MODE,
	resolveGameContext,
} from '../../helpers/gameScoring';
import { saveCompletedTrainingGame } from '../../helpers/trainingHistory/saveCompletedTrainingGame';
import useAuth from '../../hooks/useAuth';
import { useAtcFfaScoring } from '../../hooks/useAtcFfaScoring';
import { useFfaPresenceHeartbeat } from '../../hooks/useFfaPresenceHeartbeat';
import { useGameFinishedModal } from '../../hooks/useGameFinishedModal';
import { useLeaveGameConfirmation } from '../../hooks/useLeaveGameConfirmation';
import AtcCounter from './AtcCounter';
import GameFinishedModal from './GameFinishedModal';
import GameScoringModals from './GameScoringModals';
import { gameScoringScreenStyles as styles } from './GameScoringScreen.styles';
import { colors } from '../../theme/colors';

export default function AtcGameScoringScreen({ route, navigation }) {
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
	const legOpenerIndexRef = useRef(0);
	const dartLogRef = useRef([]);
	const matchEndedRef = useRef(false);
	const intentionalFfaLeaveRef = useRef(false);
	const currentPlayerIndexRef = useRef(0);
	currentPlayerIndexRef.current = currentPlayerIndex;

	const [p1, d1] = useReducer(atcReducer, undefined, initialAtcState);
	const [p2, d2] = useReducer(atcReducer, undefined, initialAtcState);
	const [p3, d3] = useReducer(atcReducer, undefined, initialAtcState);
	const [p4, d4] = useReducer(atcReducer, undefined, initialAtcState);
	const [p5, d5] = useReducer(atcReducer, undefined, initialAtcState);
	const [p6, d6] = useReducer(atcReducer, undefined, initialAtcState);
	const [p7, d7] = useReducer(atcReducer, undefined, initialAtcState);
	const [p8, d8] = useReducer(atcReducer, undefined, initialAtcState);

	const allStates = [p1, p2, p3, p4, p5, p6, p7, p8];
	const allDispatches = [d1, d2, d3, d4, d5, d6, d7, d8];
	const atcStates = allStates.slice(0, N);
	const atcDispatches = allDispatches.slice(0, N);
	const atcStatesRef = useRef(atcStates);
	atcStatesRef.current = atcStates;

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
		const winnerIdx = atcStatesRef.current.reduce(
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
		submitVisit,
		submitUndo,
	} = useAtcFfaScoring({
		enabled: syncEnabled && !!transport,
		transport,
		N,
		atcDispatches,
		setCurrentPlayerIndex,
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
			activateKeepAwakeAsync('atc-scoring').catch(() => {});
		} else {
			deactivateKeepAwake('atc-scoring');
		}
		return () => deactivateKeepAwake('atc-scoring');
	}, [isFocused]);

	const nextIndex = useCallback(
		(fromIndex) => (fromIndex + 1) % N,
		[N],
	);

	const resetBoardsLocal = useCallback(() => {
		for (let i = 0; i < N; i += 1) {
			atcDispatches[i]({ type: ATC_LEG_RESET });
		}
	}, [N, atcDispatches]);

	const finishMatchLocal = useCallback(
		(winnerIndex, winnerLegsWon) => {
			if (matchEndedRef.current) return;
			matchEndedRef.current = true;
			setGameClosed(true);
			const name = players[winnerIndex]?.name ?? 'Zwycięzca';
			if (mode === GAME_MODE.TRAINING) {
				const states = atcStatesRef.current.map((s, i) => ({
					...s,
					legsWon:
						i === winnerIndex
							? (winnerLegsWon ?? (s?.legsWon ?? 0) + 1)
							: (s?.legsWon ?? 0),
				}));
				void saveCompletedTrainingGame({
					players,
					matchFormat,
					gameType: 'atc',
					atcStates: states,
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
			atcDispatches[winnerIndex]({ type: ATC_LEG_WIN });
			const nextLegs = (atcStatesRef.current[winnerIndex]?.legsWon ?? 0) + 1;
			if (nextLegs >= legsToWin) {
				resetBoardsLocal();
				dartLogRef.current = [];
				finishMatchLocal(winnerIndex, nextLegs);
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
		[N, atcDispatches, finishMatchLocal, legsToWin, players, resetBoardsLocal],
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

	const handleVisit = (hits) => {
		if (!canInput) return;
		const parsed = Number(hits);
		if (!Number.isInteger(parsed)) return;
		const idx = currentPlayerIndex;
		const n = clampAtcHits(parsed, atcStatesRef.current[idx]?.targetIndex ?? 0);

		if (syncEnabled && transport) {
			if (!transport.assertCanInput?.(currentPlayerIndex)) return;
			const playerId = players[currentPlayerIndex]?.playerId;
			if (playerId == null) {
				Alert.alert('Błąd', 'Brak playerId gracza.');
				return;
			}
			submitVisit(playerId, n);
			return;
		}

		const states = atcStatesRef.current;
		dartLogRef.current.push({
			playerIndex: idx,
			hits: n,
			targetIndexBefore: states[idx].targetIndex,
			finishedBefore: states[idx].finished,
		});

		const applied = applyAtcVisit(states[idx].targetIndex, n);
		atcDispatches[idx]({
			type: ATC_APPLY,
			targetIndex: applied.targetIndex,
			finished: applied.finished,
		});
		if (applied.finished) {
			closeLegLocal(idx);
			return;
		}
		setCurrentPlayerIndex((i) => nextIndex(i));
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
		atcDispatches[last.playerIndex]({
			type: ATC_RESTORE,
			targetIndex: last.targetIndexBefore,
			finished: last.finishedBefore,
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
					Around the Clock · do {legsToWin} {legsToWin === 1 ? 'lega' : 'legów'}
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

			<AtcCounter
				players={players}
				atcStates={atcStates}
				currentPlayerIndex={currentPlayerIndex}
				onVisit={handleVisit}
				onUndo={handleUndo}
				gameClosed={gameClosed || isSpectator || (syncEnabled && !canInput)}
			/>
		</View>
	);
}
