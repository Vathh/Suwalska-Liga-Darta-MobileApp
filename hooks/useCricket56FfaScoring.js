import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CRICKET56_APPLY } from '../helpers/cricket56';
import { useGameScoringRealtime } from './useGameScoringRealtime';

const BACKUP_POLL_MS = 2500;

export function useCricket56FfaScoring({
	enabled,
	transport,
	N,
	cricket56Dispatches,
	setCurrentPlayerIndex,
	setCurrentRoundIndex,
	setGameClosed,
	legOpenerIndexRef,
	onFinishedQuickGameId,
	reloadKey = null,
}) {
	const lastVersionRef = useRef(-1);
	const pendingWritesRef = useRef(0);
	const writeChainRef = useRef(Promise.resolve());
	const finishedRef = useRef(false);
	const [busy, setBusy] = useState(false);
	const [canInputFromServer, setCanInputFromServer] = useState(true);

	const dispatchesRef = useRef(cricket56Dispatches);
	dispatchesRef.current = cricket56Dispatches;

	const applyState = useCallback(
		(state) => {
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
					type: CRICKET56_APPLY,
					score: Number(p.score ?? 0),
					legsWon: Number(p.legsWon ?? 0),
				});
			}

			setCurrentPlayerIndex(Number(state.turn?.currentPlayerIndex
				?? state.session.currentPlayerIndex
				?? 0));
			setCurrentRoundIndex?.(Number(state.turn?.currentRoundIndex
				?? state.session.currentRoundIndex
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
			onFinishedQuickGameId,
			setCurrentPlayerIndex,
			setCurrentRoundIndex,
			setGameClosed,
		],
	);

	const loadState = useCallback(async () => {
		if (!enabled || !transport?.fetchState) return;
		try {
			const state = await transport.fetchState();
			applyState(state);
		} catch (e) {
			console.warn('useCricket56FfaScoring loadState', e);
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
		scope: realtimeConfig?.scope ?? 'cricket56-ffa',
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
		(playerId, points) => {
			if (!transport?.recordVisit) return Promise.resolve();
			return enqueueWrite(async () => {
				try {
					const state = await transport.recordVisit({
						playerId,
						points,
						clientVisitId: transport.newClientVisitId?.() ?? transport.newClientDartId?.(),
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
		if (!transport?.undoVisit && !transport?.undoDart) return Promise.resolve();
		return enqueueWrite(async () => {
			try {
				const state = await (transport.undoVisit?.() ?? transport.undoDart());
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
