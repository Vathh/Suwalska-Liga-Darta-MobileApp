import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useIsFocused } from '@react-navigation/native';
import { Alert, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	BOB27_APPLY,
	BOB27_KIND_BUST,
	BOB27_KIND_TIE_RESET,
	BOB27_KIND_WIN,
	BOB27_LAST_TARGET_INDEX,
	BOB27_LEG_RESET,
	BOB27_LEG_WIN,
	BOB27_RESTORE,
	applyBob27Visit,
	bob27AllActiveHaveThrown,
	bob27Reducer,
	initialBob27State,
	normalizeBob27Mode,
	resolveBob27AfterCompletedVisit,
	shouldEliminateBob27,
} from '../../helpers/bob27';
import { computeNextLegOpener } from '../../helpers/computeNextLegOpener';
import { normalizeMatchFormat } from '../../helpers/matchFormat/matchFormat';
import {
	GAME_MODE,
	resolveGameContext,
} from '../../helpers/gameScoring';
import { saveCompletedTrainingGame } from '../../helpers/trainingHistory/saveCompletedTrainingGame';
import useAuth from '../../hooks/useAuth';
import { useBob27FfaScoring } from '../../hooks/useBob27FfaScoring';
import { useFfaPresenceHeartbeat } from '../../hooks/useFfaPresenceHeartbeat';
import { useGameFinishedModal } from '../../hooks/useGameFinishedModal';
import { useLeaveGameConfirmation } from '../../hooks/useLeaveGameConfirmation';
import Bob27Counter from './Bob27Counter';
import GameFinishedModal from './GameFinishedModal';
import GameScoringModals from './GameScoringModals';
import { gameScoringScreenStyles as styles } from './GameScoringScreen.styles';
import { colors } from '../../theme/colors';

export default function Bob27GameScoringScreen({ route, navigation }) {
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
	const bob27Mode = normalizeBob27Mode(matchFormat.bob27Mode);

	const [isModalVisible, setIsModalVisible] = useState(!!showStartModal);
	const [gameClosed, setGameClosed] = useState(false);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [dartsInVisit, setDartsInVisit] = useState(0);
	const [hitsInVisit, setHitsInVisit] = useState(0);
	const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
	const thrownThisTargetRef = useRef({});
	const legOpenerIndexRef = useRef(0);
	const dartLogRef = useRef([]);
	const matchEndedRef = useRef(false);
	const intentionalFfaLeaveRef = useRef(false);
	const currentPlayerIndexRef = useRef(0);
	currentPlayerIndexRef.current = currentPlayerIndex;

	const [p1, d1] = useReducer(bob27Reducer, undefined, initialBob27State);
	const [p2, d2] = useReducer(bob27Reducer, undefined, initialBob27State);
	const [p3, d3] = useReducer(bob27Reducer, undefined, initialBob27State);
	const [p4, d4] = useReducer(bob27Reducer, undefined, initialBob27State);
	const [p5, d5] = useReducer(bob27Reducer, undefined, initialBob27State);
	const [p6, d6] = useReducer(bob27Reducer, undefined, initialBob27State);
	const [p7, d7] = useReducer(bob27Reducer, undefined, initialBob27State);
	const [p8, d8] = useReducer(bob27Reducer, undefined, initialBob27State);

	const allStates = [p1, p2, p3, p4, p5, p6, p7, p8];
	const allDispatches = [d1, d2, d3, d4, d5, d6, d7, d8];
	const bob27States = allStates.slice(0, N);
	const bob27Dispatches = allDispatches.slice(0, N);
	const bob27StatesRef = useRef(bob27States);
	bob27StatesRef.current = bob27States;

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
		const winnerIdx = bob27StatesRef.current.reduce(
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
	} = useBob27FfaScoring({
		enabled: syncEnabled && !!transport,
		transport,
		N,
		bob27Dispatches,
		setCurrentPlayerIndex,
		setDartsInVisit,
		setHitsInVisit,
		setCurrentTargetIndex,
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
			activateKeepAwakeAsync('bob27-scoring').catch(() => {});
		} else {
			deactivateKeepAwake('bob27-scoring');
		}
		return () => deactivateKeepAwake('bob27-scoring');
	}, [isFocused]);

	const nextActiveIndex = useCallback(
		(fromIndex, states) => {
			for (let step = 1; step <= N; step += 1) {
				const candidate = (fromIndex + step) % N;
				if (!states[candidate]?.eliminated) return candidate;
			}
			return fromIndex;
		},
		[N],
	);

	const resetBoardsLocal = useCallback(() => {
		for (let i = 0; i < N; i += 1) {
			bob27Dispatches[i]({ type: BOB27_LEG_RESET });
		}
		thrownThisTargetRef.current = {};
		setCurrentTargetIndex(0);
		setDartsInVisit(0);
		setHitsInVisit(0);
	}, [N, bob27Dispatches]);

	const finishMatchLocal = useCallback(
		(winnerIndex, winnerLegsWon, lost = false) => {
			if (matchEndedRef.current) return;
			matchEndedRef.current = true;
			setGameClosed(true);
			const name = players[winnerIndex]?.name ?? 'Zwycięzca';
			if (mode === GAME_MODE.TRAINING) {
				const states = bob27StatesRef.current.map((s, i) => ({
					...s,
					legsWon:
						i === winnerIndex && !lost
							? (winnerLegsWon ?? (s?.legsWon ?? 0) + 1)
							: (s?.legsWon ?? 0),
				}));
				void saveCompletedTrainingGame({
					players,
					matchFormat,
					gameType: 'bob27',
					bob27States: states,
				});
				showFinished({ winnerName: name, kind: 'training', lost });
			} else {
				showFinished({ winnerName: name, kind: 'quick', lost });
			}
		},
		[mode, players, matchFormat, showFinished],
	);

	const closeLegLocal = useCallback(
		(winnerIndex) => {
			bob27Dispatches[winnerIndex]({ type: BOB27_LEG_WIN });
			const nextLegs = (bob27StatesRef.current[winnerIndex]?.legsWon ?? 0) + 1;
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
		[N, bob27Dispatches, finishMatchLocal, legsToWin, players, resetBoardsLocal],
	);

	const advanceAfterVisitLocal = useCallback(
		(statesAfter, playerIndex) => {
			const thrown = { ...thrownThisTargetRef.current, [playerIndex]: true };
			thrownThisTargetRef.current = thrown;
			const outcome = resolveBob27AfterCompletedVisit(
				statesAfter,
				bob27Mode,
				currentTargetIndex,
				thrown,
			);

			if (outcome.kind === BOB27_KIND_WIN) {
				closeLegLocal(outcome.winnerIndex);
				return;
			}
			if (outcome.kind === BOB27_KIND_BUST) {
				resetBoardsLocal();
				dartLogRef.current = [];
				finishMatchLocal(playerIndex, 0, true);
				return;
			}
			if (outcome.kind === BOB27_KIND_TIE_RESET) {
				resetBoardsLocal();
				setCurrentPlayerIndex(legOpenerIndexRef.current);
				Alert.alert('Remis', 'Ten sam wynik po Bull — runda od nowa.', [
					{ text: 'OK' },
				]);
				return;
			}

			if (
				bob27AllActiveHaveThrown(statesAfter, thrown)
				&& currentTargetIndex < BOB27_LAST_TARGET_INDEX
			) {
				setCurrentTargetIndex((idx) => idx + 1);
				thrownThisTargetRef.current = {};
			}

			setDartsInVisit(0);
			setHitsInVisit(0);
			setCurrentPlayerIndex((idx) => nextActiveIndex(idx, statesAfter));
		},
		[
			bob27Mode,
			closeLegLocal,
			currentTargetIndex,
			finishMatchLocal,
			nextActiveIndex,
			resetBoardsLocal,
		],
	);

	const isSpectator =
		syncEnabled && lobbyScoringMode === 'one_device' && !isHost;

	const canInput =
		!gameClosed &&
		!isModalVisible &&
		!busy &&
		!isSpectator &&
		!(bob27States[currentPlayerIndex]?.eliminated) &&
		(!syncEnabled || canInputFromServer) &&
		(!syncEnabled
			|| lobbyScoringMode !== 'each_own'
			|| myPlayerIndex === null
			|| myPlayerIndex === currentPlayerIndex);

	const handleDart = (kind) => {
		if (!canInput) return;
		if (syncEnabled && transport) {
			if (!transport.assertCanInput?.(currentPlayerIndex)) return;
			const playerId = players[currentPlayerIndex]?.playerId;
			if (playerId == null) {
				Alert.alert('Błąd', 'Brak playerId gracza.');
				return;
			}
			if (kind === 'hit') submitHit(playerId);
			else submitMiss(playerId);
			return;
		}

		const idx = currentPlayerIndex;
		const states = bob27StatesRef.current;
		dartLogRef.current.push({
			playerIndex: idx,
			kind,
			scoreBefore: states[idx].score,
			eliminatedBefore: states[idx].eliminated,
			dartsInVisitBefore: dartsInVisit,
			hitsInVisitBefore: hitsInVisit,
			targetIndexBefore: currentTargetIndex,
			thrownBefore: { ...thrownThisTargetRef.current },
		});

		const nextHits = hitsInVisit + (kind === 'hit' ? 1 : 0);
		const nextDarts = dartsInVisit + 1;
		if (nextDarts < 3) {
			setHitsInVisit(nextHits);
			setDartsInVisit(nextDarts);
			return;
		}

		const scoreAfter = applyBob27Visit(states[idx].score, nextHits, currentTargetIndex);
		const eliminated = shouldEliminateBob27(scoreAfter, bob27Mode);
		bob27Dispatches[idx]({
			type: BOB27_APPLY,
			score: scoreAfter,
			eliminated,
		});
		const statesAfter = states.map((s, i) =>
			i === idx ? { ...s, score: scoreAfter, eliminated } : s,
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
		setDartsInVisit(last.dartsInVisitBefore);
		setHitsInVisit(last.hitsInVisitBefore);
		setCurrentTargetIndex(last.targetIndexBefore);
		thrownThisTargetRef.current = last.thrownBefore ?? {};
		bob27Dispatches[last.playerIndex]({
			type: BOB27_RESTORE,
			score: last.scoreBefore,
			eliminated: last.eliminatedBefore,
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
				scoringBusyLabel="Zapisywanie rzutu…"
			/>

			<GameFinishedModal {...finishedModalProps} />

			<View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
				<Text style={{ color: colors.textDim, textAlign: 'center', fontSize: 13 }}>
					Bob's 27 · {bob27Mode} · do {legsToWin} {legsToWin === 1 ? 'lega' : 'legów'}
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

			<Bob27Counter
				players={players}
				bob27States={bob27States}
				currentPlayerIndex={currentPlayerIndex}
				currentTargetIndex={currentTargetIndex}
				dartsInVisit={dartsInVisit}
				hitsInVisit={hitsInVisit}
				onHit={() => handleDart('hit')}
				onMiss={() => handleDart('miss')}
				onUndo={handleUndo}
				gameClosed={gameClosed || isSpectator || (syncEnabled && !canInput)}
				mode={bob27Mode}
			/>
		</View>
	);
}
