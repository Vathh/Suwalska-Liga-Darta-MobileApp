import { useEffect, useRef } from 'react';
import {
	GAME_MODE,
	findWinnerIndex,
	mapAchievementsForQuick,
	mapAchievementsForTournament,
	sendQuickGameAchievements,
	sendTournamentAchievements,
	shouldHandleLocalTrainingWin,
	showGameFinishedAlert,
	showTrainingFinishedAlert,
} from '../helpers/gameScoring';

/**
 * Efekty końca meczu (quick FFA / trening lokalny / turniej): wysyłka achievementów
 * i alert zwycięzcy. Wydzielone z GameScoringScreen bez zmiany logiki/warunków.
 */
export function useGameFinishedEffects({
	mode,
	gameClosed,
	setGameClosed,
	syncEnabled,
	players,
	playerStates,
	matchFormat,
	achievementsState,
	accessToken,
	ffaFinishedQuickGameId,
	finishedQuickGameIdRef,
	activeGame,
	N,
}) {
	const quickResultSentRef = useRef(false);
	const tournamentResultSentRef = useRef(false);

	useEffect(() => {
		if (!gameClosed || mode !== GAME_MODE.QUICK_FFA) return;
		if (quickResultSentRef.current) return;
		quickResultSentRef.current = true;

		const achievementsPayload = mapAchievementsForQuick(achievementsState);
		const gameId =
			ffaFinishedQuickGameId ?? finishedQuickGameIdRef?.current ?? null;
		if (gameId) {
			void sendQuickGameAchievements({
				accessToken,
				gameId,
				achievementsPayload,
			});
		}

		const winnerIdx = findWinnerIndex(playerStates, matchFormat);
		showGameFinishedAlert(players[winnerIdx]?.name, {
			title: 'Mecz zakończony',
		});
	}, [
		gameClosed,
		mode,
		ffaFinishedQuickGameId,
		achievementsState?.achievements,
		accessToken,
		players,
		playerStates,
		matchFormat,
		finishedQuickGameIdRef,
	]);

	useEffect(() => {
		if (
			!shouldHandleLocalTrainingWin({
				mode,
				syncEnabled,
				playerStates,
				matchFormat,
			})
		) {
			return;
		}
		if (gameClosed) return;

		setGameClosed(true);
		const winnerIdx = findWinnerIndex(playerStates, matchFormat);
		showTrainingFinishedAlert(players[winnerIdx]?.name);
	}, [mode, syncEnabled, gameClosed, matchFormat, playerStates, players]);

	useEffect(() => {
		if (!gameClosed || mode !== GAME_MODE.TOURNAMENT || !syncEnabled) return;
		if (tournamentResultSentRef.current) return;
		tournamentResultSentRef.current = true;

		const winnerIdx = findWinnerIndex(playerStates, matchFormat);
		const achievementsPayload = mapAchievementsForTournament(achievementsState);
		if (achievementsPayload.length > 0) {
			void sendTournamentAchievements({
				accessToken,
				activeGame,
				players,
				playerStates,
				N,
				achievements: achievementsPayload,
				matchFormat,
			});
		}
		showGameFinishedAlert(players[winnerIdx]?.name);
	}, [
		gameClosed,
		mode,
		syncEnabled,
		matchFormat,
		achievementsState?.achievements,
		accessToken,
		activeGame,
		players,
		playerStates,
		N,
	]);
}
