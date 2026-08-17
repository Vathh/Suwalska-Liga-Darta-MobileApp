import { Alert } from 'react-native';
import {
	fetchFfaScoringState,
	recordFfaCricket56Visit,
	undoFfaCricket56Visit,
} from '../../quickGameFfaApi';
import { newClientVisitId } from '../newClientVisitId.js';

const FFA_WS_EVENTS = ['ffa.state.updated', '.ffa.state.updated'];

function unwrapFfaPayload(data) {
	const state = data?.state ?? data;
	return state?.session ? state : null;
}

export function createFfaCricket56Transport({
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
		format: 'ffa_cricket56',
		fetchState: () => fetchFfaScoringState(lobbyId, accessToken),
		recordVisit: (payload) =>
			recordFfaCricket56Visit(lobbyId, accessToken, payload),
		undoVisit: () => undoFfaCricket56Visit(lobbyId, accessToken),
		newClientVisitId,
		getRealtimeConfig: () => ({
			channelName: `private-quick-game-lobby.${lobbyId}`,
			channelType: 'private',
			accessToken,
			events: FFA_WS_EVENTS,
			scope: 'quick-game-ffa-cricket56',
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
