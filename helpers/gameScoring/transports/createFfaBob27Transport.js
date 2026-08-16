import { Alert } from 'react-native';
import {
	fetchFfaScoringState,
	recordFfaBob27Dart,
	undoFfaBob27Dart,
} from '../../quickGameFfaApi';
import { newClientVisitId } from '../newClientVisitId.js';

const FFA_WS_EVENTS = ['ffa.state.updated', '.ffa.state.updated'];

function unwrapFfaPayload(data) {
	const state = data?.state ?? data;
	return state?.session ? state : null;
}

/**
 * Transport Bob's 27 FFA (hit/miss/undo) — analogiczny do cricket.
 */
export function createFfaBob27Transport({
	lobbyId,
	accessToken,
	lobbyScoringMode,
	isHost,
	myPlayerIndexFromLobby,
	getCurrentPlayerIndex = null,
}) {
	const assertHostForOneDevice = (actionLabel) => {
		if (lobbyScoringMode === 'one_device' && !isHost) {
			Alert.alert(
				'Info',
				`W trybie „jedno urządzenie” ${actionLabel} tylko host.`,
			);
			return false;
		}
		return true;
	};

	return {
		format: 'ffa_bob27',
		fetchState: () => fetchFfaScoringState(lobbyId, accessToken),
		recordDart: (payload) =>
			recordFfaBob27Dart(lobbyId, accessToken, payload),
		undoDart: () => undoFfaBob27Dart(lobbyId, accessToken),
		newClientDartId: newClientVisitId,
		getRealtimeConfig: () => ({
			channelName: `private-quick-game-lobby.${lobbyId}`,
			channelType: 'private',
			accessToken,
			events: FFA_WS_EVENTS,
			scope: 'quick-game-ffa-bob27',
			unwrapPayload: unwrapFfaPayload,
		}),
		assertCanInput: (playerIndex) => {
			if (!assertHostForOneDevice('punkty wpisuje')) {
				return false;
			}
			if (lobbyScoringMode === 'each_own' && myPlayerIndexFromLobby !== null) {
				if (playerIndex !== myPlayerIndexFromLobby) {
					Alert.alert('Info', 'Możesz wpisywać tylko własne rzuty.');
					return false;
				}
				const turnIdx = getCurrentPlayerIndex?.();
				if (
					turnIdx !== null &&
					turnIdx !== undefined &&
					turnIdx !== myPlayerIndexFromLobby
				) {
					Alert.alert('Info', 'Czekaj na swoją kolejkę.');
					return false;
				}
			}
			return true;
		},
		assertCanUndo: () => assertHostForOneDevice('cofa'),
	};
}
