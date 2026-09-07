import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CATCH40_APPLY } from '../helpers/catch40';
import { consumeFfaAbortPayload } from '../helpers/gameScoring/ffaClosedStatus.js';
import { useGameScoringRealtime } from './useGameScoringRealtime';

const BACKUP_POLL_MS = 2500;

export function useCatch40FfaScoring({
	enabled,
	transport,
	N,
	catch40Dispatches,
	setCurrentPlayerIndex,
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

	const dispatchesRef = useRef(catch40Dispatches);
	dispatchesRef.current = catch40Dispatches;

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
					type: CATCH40_APPLY,
					outNumber: Number(p.outNumber ?? 61),
					remaining: Number(p.remaining ?? 61),
					dartsUsed: Number(p.dartsUsed ?? 0),
					catch40Score: Number(p.catch40Score ?? 0),
					finished: !!p.finished,
					legsWon: Number(p.legsWon ?? 0),
				});
			}

			setCurrentPlayerIndex(Number(state.turn?.currentPlayerIndex
				?? state.session.currentPlayerIndex
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
			setGameClosed,
		],
	);

	const loadState = useCallback(async () => {
		if (!enabled || !transport?.fetchState) return;
		try {
			const state = await transport.fetchState();
			applyState(state);
		} catch (e) {
			console.warn('useCatch40FfaScoring loadState', e);
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
		scope: realtimeConfig?.scope ?? 'catch40-ffa',
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
		(payload) => {
			if (!transport?.recordVisit) return Promise.resolve();
			return enqueueWrite(async () => {
				try {
					const state = await transport.recordVisit({
						...payload,
						clientVisitId: payload.clientVisitId ?? transport.newClientVisitId(),
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
		if (!transport?.undoVisit) return Promise.resolve();
		return enqueueWrite(async () => {
			try {
				const state = await transport.undoVisit();
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
