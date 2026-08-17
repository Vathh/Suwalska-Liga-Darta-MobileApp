import { normalizeMatchFormat } from '../matchFormat/matchFormat.js';
import {
	getGroupGameScoringBaseUrl,
	getPlayoffGameScoringBaseUrl,
} from '../apiConfig';
import { normalizeTournamentPlayers } from '../normalizeTournamentPlayers';
import { createFfaTransport } from './transports/createFfaTransport.js';
import { createFfaCricketTransport } from './transports/createFfaCricketTransport.js';
import { createFfaBob27Transport } from './transports/createFfaBob27Transport.js';
import { createFfaAtcTransport } from './transports/createFfaAtcTransport.js';
import { createFfaCatch40Transport } from './transports/createFfaCatch40Transport.js';
import { createFfaCricket56Transport } from './transports/createFfaCricket56Transport.js';
import { createTournamentTransport } from './transports/createTournamentTransport.js';

export const GAME_MODE = {
	TRAINING: 'training',
	QUICK_FFA: 'quick_ffa',
	TOURNAMENT: 'tournament',
};

function mapQuickPlayers(players) {
	return (players ?? []).map((p) => ({
		id: p.id,
		name: p.name ?? 'Gracz',
		playerId: p.playerId != null ? Number(p.playerId) : null,
	}));
}

function resolveMyPlayerIndex(matchConfig, auth, players) {
	if (
		matchConfig?.myPlayerIndex !== undefined &&
		matchConfig?.myPlayerIndex !== null
	) {
		return matchConfig.myPlayerIndex;
	}
	if (auth?.playerId != null) {
		const idx = players.findIndex(
			(p) => p.playerId != null && p.playerId === Number(auth.playerId),
		);
		if (idx >= 0) {
			return idx;
		}
	}
	return null;
}

/**
 * Jedno miejsce na kontekst meczu z parametrów nawigacji.
 * @param {object} options - opcjonalny `getCurrentPlayerIndex()` doprowadzany do transportu FFA,
 *   żeby `assertCanInput` widział aktualną turę (chroni przed race po WS update w trakcie zapisu).
 */
export function resolveGameContext(routeParams, auth, options = {}) {
	const { getCurrentPlayerIndex = null } = options;
	const trainingGame = routeParams?.trainingGame ?? null;
	const quickGame = routeParams?.quickGame ?? null;
	const tournamentGame = routeParams?.game ?? null;

	const isTraining = !!trainingGame;
	const isQuick = !!quickGame && !isTraining;
	const isTournament = !!tournamentGame?.id;

	let mode = GAME_MODE.TRAINING;
	if (isTournament) {
		mode = GAME_MODE.TOURNAMENT;
	} else if (isQuick) {
		mode = GAME_MODE.QUICK_FFA;
	}

	const matchConfig = isTraining ? trainingGame : quickGame;
	const lobbyId = quickGame?.lobbyId ?? null;
	const lobbyScoringMode = matchConfig?.scoringMode ?? 'each_own';
	const isHost = matchConfig?.isHost ?? true;
	const matchFormat = normalizeMatchFormat(matchConfig?.matchFormat);

	const players = isTraining || isQuick
		? mapQuickPlayers(matchConfig?.players)
		: tournamentGame
			? normalizeTournamentPlayers(
					tournamentGame.player1,
					tournamentGame.player2,
				)
			: [];

	const resolvedGameType = String(
		matchFormat?.gameType
			?? quickGame?.gameType
			?? trainingGame?.gameType
			?? 'x01',
	).toLowerCase();
	const isCricket = resolvedGameType === 'cricket';
	const isBob27 = resolvedGameType === 'bob27';
	const isAtc = resolvedGameType === 'atc' || resolvedGameType === 'around_the_clock';
	const isCatch40 = resolvedGameType === 'catch40' || resolvedGameType === 'catch_40';
	const isCricket56 = resolvedGameType === 'cricket56'
		|| resolvedGameType === 'cricket_56'
		|| resolvedGameType === 'cricketsequence';
	const minPlayers = mode === GAME_MODE.TRAINING ? 1 : 2;
	const N = Math.min(Math.max(players.length, minPlayers), 8);
	const myPlayerIndex = resolveMyPlayerIndex(matchConfig, auth, players);

	const hasOnlineQuick =
		isQuick &&
		!!lobbyId &&
		!isCricket &&
		!isBob27 &&
		!isAtc &&
		!isCatch40 &&
		!isCricket56 &&
		(quickGame?.gameType === '501'
			|| quickGame?.gameType === 'x01'
			|| quickGame?.gameType === undefined
			|| resolvedGameType === 'x01');
	const hasOnlineCricket = isQuick && !!lobbyId && isCricket;
	const hasOnlineBob27 = isQuick && !!lobbyId && isBob27;
	const hasOnlineAtc = isQuick && !!lobbyId && isAtc;
	const hasOnlineCatch40 = isQuick && !!lobbyId && isCatch40;
	const hasOnlineCricket56 = isQuick && !!lobbyId && isCricket56;
	const accessToken = auth?.accessToken ?? null;

	let transport = null;
	let reloadKey = null;

	if (isTournament && accessToken) {
		const baseUrl =
			tournamentGame.type === 'playoff'
				? getPlayoffGameScoringBaseUrl(tournamentGame.id)
				: getGroupGameScoringBaseUrl(tournamentGame.id);
		const channelKind =
			tournamentGame.type === 'playoff' ? 'playoff' : 'group';
		transport = createTournamentTransport({
			baseUrl,
			accessToken,
			channelKind,
			gameId: tournamentGame.id,
		});
		reloadKey = tournamentGame.id;
	} else if (hasOnlineCricket && accessToken) {
		transport = createFfaCricketTransport({
			lobbyId,
			accessToken,
			lobbyScoringMode,
			isHost,
			myPlayerIndexFromLobby: myPlayerIndex,
			getCurrentPlayerIndex,
		});
		reloadKey = lobbyId;
	} else if (hasOnlineBob27 && accessToken) {
		transport = createFfaBob27Transport({
			lobbyId,
			accessToken,
			lobbyScoringMode,
			isHost,
			myPlayerIndexFromLobby: myPlayerIndex,
			getCurrentPlayerIndex,
		});
		reloadKey = lobbyId;
	} else if (hasOnlineAtc && accessToken) {
		transport = createFfaAtcTransport({
			lobbyId,
			accessToken,
			lobbyScoringMode,
			isHost,
			myPlayerIndexFromLobby: myPlayerIndex,
			getCurrentPlayerIndex,
		});
		reloadKey = lobbyId;
	} else if (hasOnlineCatch40 && accessToken) {
		transport = createFfaCatch40Transport({
			lobbyId,
			accessToken,
			lobbyScoringMode,
			isHost,
			myPlayerIndexFromLobby: myPlayerIndex,
			getCurrentPlayerIndex,
		});
		reloadKey = lobbyId;
	} else if (hasOnlineCricket56 && accessToken) {
		transport = createFfaCricket56Transport({
			lobbyId,
			accessToken,
			lobbyScoringMode,
			isHost,
			myPlayerIndexFromLobby: myPlayerIndex,
			getCurrentPlayerIndex,
		});
		reloadKey = lobbyId;
	} else if (hasOnlineQuick && accessToken) {
		transport = createFfaTransport({
			lobbyId,
			accessToken,
			lobbyScoringMode,
			isHost,
			myPlayerIndexFromLobby: myPlayerIndex,
			getCurrentPlayerIndex,
		});
		reloadKey = lobbyId;
	}

	const syncEnabled = transport != null;
	// Trening: kolejność ustalana na setupie — bez modala „Kto rozpoczyna”.
	const showStartModal = isQuick && !syncEnabled;

	const activeGame = isTraining
		? { id: null, type: 'training', tournamentId: null, groupNumber: null }
		: isQuick
			? {
					id: null,
					type: 'quick_game',
					tournamentId: null,
					groupNumber: null,
				}
			: tournamentGame;

	return {
		mode,
		syncEnabled,
		showStartModal,
		players,
		N,
		matchFormat,
		transport,
		reloadKey,
		lobbyScoringMode,
		isHost,
		myPlayerIndex,
		tournamentGame: isTournament ? tournamentGame : null,
		activeGame,
		lobbyId,
	};
}
