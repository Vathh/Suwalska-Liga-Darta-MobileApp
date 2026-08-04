import { buildTrainingGameRecord } from './buildTrainingGameRecord';
import { saveTrainingGame } from './persistTrainingHistory';
import { applyTrainingGameToTempPlayerStats } from './persistTempPlayerStats';

/**
 * Zapisuje zakończony trening lokalnie (historia + kariera graczy z bazy).
 */
export async function saveCompletedTrainingGame({
	players,
	playerStates,
	matchFormat,
	gameType = 'x01',
	cricketStates = null,
}) {
	const game = buildTrainingGameRecord({
		players,
		playerStates,
		matchFormat,
		gameType,
		cricketStates,
	});
	await saveTrainingGame(game);
	await applyTrainingGameToTempPlayerStats(game);
	return game;
}
