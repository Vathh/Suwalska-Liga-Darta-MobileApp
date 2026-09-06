import { buildTrainingGameRecord } from './buildTrainingGameRecord';
import { saveTrainingGame } from './persistTrainingHistory';
import { applyTrainingGameToTempPlayerStats } from './persistTempPlayerStats';
import { syncTrainingCareerIfNeeded } from './trainingCareerSync';
import { newClientVisitId } from '../gameScoring/newClientVisitId';

/**
 * Zapisuje zakończony trening lokalnie (historia + kariera graczy z bazy).
 * Slot JA (isSelf) idzie na konto — kumple lokalni nigdy.
 */
export async function saveCompletedTrainingGame({
	players,
	playerStates,
	matchFormat,
	gameType = 'x01',
	cricketStates = null,
	bob27States = null,
	atcStates = null,
	catch40States = null,
	cricket56States = null,
	accessToken = null,
	isPerDart = false,
	doubleStatsByIndex = null,
	eventLog = null,
	visitLog = null,
	selfExtras = null,
}) {
	const game = buildTrainingGameRecord({
		players,
		playerStates,
		matchFormat,
		gameType,
		cricketStates,
		bob27States,
		atcStates,
		catch40States,
		cricket56States,
	});
	await saveTrainingGame(game);
	await applyTrainingGameToTempPlayerStats(game);
	await syncTrainingCareerIfNeeded({
		players,
		playerStates,
		matchFormat,
		gameType: game.gameType,
		clientUuid: newClientVisitId(),
		completedAt: game.playedAt,
		doubleStatsByIndex,
		isPerDart,
		accessToken,
		eventLog,
		visitLog,
		selfExtras,
	});
	return game;
}
