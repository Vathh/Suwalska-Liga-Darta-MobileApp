import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { BOB27_APPLY } from '../helpers/bob27';
import { consumeFfaAbortPayload } from '../helpers/gameScoring/ffaClosedStatus.js';
import { useGameScoringRealtime } from './useGameScoringRealtime';

const BACKUP_POLL_MS = 2500;

/**
 * Sync stanu Bob's 27 FFA (GET + WS + poll). Wzorzec jak useCricketFfaScoring.
 */
export function useBob27FfaScoring({
	enabled,
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
	onAborted,
	reloadKey = null,
}) {
	const lastVersionRef = useRef(-1);
	const pendingWritesRef = useRef(0);
	const writeChainRef = useRef(Promise.resolve());
	const finishedRef = useRef(false);
	const abortedRef = useRef(false);
	const [busy, setBusy] = useState(false);
	const [canInputFromServer, setCanInputFromServer] = useState(true);

	const dispatchesRef = useRef(bob27Dispatches);
	dispatchesRef.current = bob27Dispatches;

	const applyState = useCallback(
		(state) => {
			if (
				consumeFfaAbortPayload(state, {
					setGameClosed,
					onAborted,
					handledRef: abortedRef,
				})
			) {
				return;
			}
			if (!state?.session || !Array.isArray(state.players)) {
				return;
			}
			const version = Number(state.session.stateVersion ?? 0);
			if (version < lastVersionRef.current && pendingWritesRef.current > 0) {
				return;
			}
			lastVersionRef.current = version;

			const status = state.session.status ?? state.game?.status;
			if (status === 'finished') {
				setGameClosed(true);
				const qid = state.session.quickGameId;
				if (qid != null && !finishedRef.current) {
					finishedRef.current = true;
					onFinishedQuickGameId?.(qid);
				}
			}

			const dispatches = dispatchesRef.current;
			for (let i = 0; i < N; i += 1) {
				const p = state.players[i];
				if (!p || !dispatches[i]) continue;
				dispatches[i]({
					type: BOB27_APPLY,
					score: Number(p.score ?? 27),
					eliminated: !!p.eliminated,
					legsWon: Number(p.legsWon ?? 0),
				});
			}

			setCurrentPlayerIndex(Number(state.turn?.currentPlayerIndex
				?? state.session.currentPlayerIndex
				?? 0));
			setDartsInVisit(Number(state.turn?.dartsInVisit
				?? state.session.dartsInVisit
				?? 0));
			setHitsInVisit?.(Number(state.turn?.hitsInVisit
				?? state.session.hitsInVisit
				?? 0));
			setCurrentTargetIndex?.(Number(state.turn?.currentTargetIndex
				?? state.session.currentTargetIndex
				?? 0));
			if (legOpenerIndexRef) {
				legOpenerIndexRef.current = Number(
					state.turn?.legOpenerIndex ?? state.session.legOpenerIndex ?? 0,
				);
			}
			setCanInputFromServer(state.you?.canInput !== false);
		},
		[
			N,
			legOpenerIndexRef,
			onAborted,
			onFinishedQuickGameId,
			setCurrentPlayerIndex,
			setCurrentTargetIndex,
			setDartsInVisit,
			setGameClosed,
			setHitsInVisit,
		],
	);

	const loadState = useCallback(async () => {
		if (!enabled || !transport?.fetchState) return;
		try {
			const state = await transport.fetchState();
			applyState(state);
		} catch (e) {
			console.warn('useBob27FfaScoring loadState', e);
		}
	}, [applyState, enabled, transport]);

	useEffect(() => {
		if (!enabled) return undefined;
		lastVersionRef.current = -1;
		finishedRef.current = false;
		loadState();
		const id = setInterval(() => {
			if (pendingWritesRef.current > 0) return;
			loadState();
		}, BACKUP_POLL_MS);
		return () => clearInterval(id);
	}, [enabled, loadState, reloadKey]);

	const realtimeConfig = useMemo(
		() => transport?.getRealtimeConfig?.() ?? null,
		[transport],
	);

	useGameScoringRealtime({
		channelName: realtimeConfig?.channelName,
		enabled: enabled && !!realtimeConfig?.channelName,
		channelType: realtimeConfig?.channelType ?? 'private',
		accessToken: realtimeConfig?.accessToken ?? null,
		events: realtimeConfig?.events,
		scope: realtimeConfig?.scope ?? 'bob27-ffa',
		unwrapPayload: realtimeConfig?.unwrapPayload,
		onGameState: applyState,
		onWsHealthChange: () => {},
	});

	const enqueueWrite = useCallback(
		(fn) => {
			pendingWritesRef.current += 1;
			setBusy(true);
			const run = writeChainRef.current.then(fn).finally(() => {
				pendingWritesRef.current = Math.max(0, pendingWritesRef.current - 1);
				if (pendingWritesRef.current === 0) {
					setBusy(false);
				}
			});
			writeChainRef.current = run.catch(() => {});
			return run;
		},
		[],
	);

	const submitVisit = useCallback(
		(playerId, hits) => {
			if (!transport?.recordVisit) return Promise.resolve();
			return enqueueWrite(async () => {
				try {
					const state = await transport.recordVisit({
						playerId,
						hits,
						clientDartId: transport.newClientDartId(),
					});
					applyState(state);
				} catch (e) {
					Alert.alert('Błąd', e?.message ?? 'Nie udało się zapisać wizyty');
					await loadState();
					throw e;
				}
			});
		},
		[applyState, enqueueWrite, loadState, transport],
	);

	const submitUndo = useCallback(() => {
		if (!transport?.undoDart) return Promise.resolve();
		return enqueueWrite(async () => {
			try {
				const state = await transport.undoDart();
				applyState(state);
			} catch (e) {
				Alert.alert('Błąd', e?.message ?? 'Nie udało się cofnąć');
				await loadState();
				throw e;
			}
		});
	}, [applyState, enqueueWrite, loadState, transport]);

	return {
		busy,
		canInputFromServer,
		submitVisit,
		submitUndo,
		reload: loadState,
	};
}
