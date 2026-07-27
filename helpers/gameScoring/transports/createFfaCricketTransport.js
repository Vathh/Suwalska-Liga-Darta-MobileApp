import { Alert } from 'react-native';
import {
	fetchFfaScoringState,
	recordFfaCricketDart,
	undoFfaCricketDart,
} from '../../quickGameFfaApi';
import { newClientVisitId } from '../newClientVisitId.js';

const FFA_WS_EVENTS = ['ffa.state.updated', '.ffa.state.updated'];

function unwrapFfaPayload(data) {
	const state = data?.state ?? data;
	return state?.session ? state : null;
}

/**
 * Transport cricket FFA (hit/miss/undo) — osobny od wizyt X01.
 */
export function createFfaCricketTransport({
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
		format: 'ffa_cricket',
		fetchState: () => fetchFfaScoringState(lobbyId, accessToken),
		recordDart: (payload) =>
			recordFfaCricketDart(lobbyId, accessToken, payload),
		undoDart: () => undoFfaCricketDart(lobbyId, accessToken),
		newClientDartId: newClientVisitId,
		getRealtimeConfig: () => ({
			channelName: `private-quick-game-lobby.${lobbyId}`,
			channelType: 'private',
			accessToken,
			events: FFA_WS_EVENTS,
			scope: 'quick-game-ffa-cricket',
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
