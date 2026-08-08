import { useEffect } from 'react';
import { Alert } from 'react-native';
import { GAME_MODE } from '../helpers/gameScoring';
import { releaseTournamentGame } from '../helpers/lockTournamentGame';
import { postFfaPresence } from '../helpers/quickGameFfaApi';

/**
 * Potwierdzenie wyjścia z ekranu scoringu — zwalnia mecz turniejowy / oznacza
 * obecność FFA jako „left”, zanim nawigacja faktycznie przejdzie dalej.
 * Po zakończeniu meczu (gameClosed) wyjście bez dodatkowego alertu.
 *
 * @param {() => void} [onClosedLeave] — np. wylogowanie tabletu po finale turnieju
 */
export function useLeaveGameConfirmation({
	navigation,
	mode,
	gameClosed,
	tournamentGame,
	accessToken,
	syncEnabled,
	lobbyId,
	intentionalFfaLeaveRef,
	onClosedLeave,
}) {
	useEffect(
		() =>
			navigation.addListener('beforeRemove', (e) => {
				if (gameClosed) {
					onClosedLeave?.();
					return;
				}

				e.preventDefault();

				Alert.alert('UWAGA', 'Czy na pewno chcesz opuścić mecz?', [
					{ text: 'KONTYNUUJ MECZ', style: 'cancel', onPress: () => {} },
					{
						text: 'OPUŚĆ MECZ',
						style: 'destructive',
						onPress: async () => {
							if (
								mode === GAME_MODE.TOURNAMENT &&
								tournamentGame?.id &&
								accessToken
							) {
								await releaseTournamentGame({
									gameId: tournamentGame.id,
									type: tournamentGame.type === 'playoff' ? 'playoff' : 'group',
									accessToken,
								});
							}
							if (
								mode === GAME_MODE.QUICK_FFA &&
								syncEnabled &&
								lobbyId &&
								accessToken
							) {
								intentionalFfaLeaveRef.current = true;
								try {
									await postFfaPresence(lobbyId, accessToken, 'left');
								} catch {
									// Wyjście z ekranu i tak dozwolone
								}
							}
							navigation.dispatch(e.data.action);
						},
					},
				]);
			}),
		[
			navigation,
			mode,
			gameClosed,
			tournamentGame,
			accessToken,
			syncEnabled,
			lobbyId,
			intentionalFfaLeaveRef,
			onClosedLeave,
		],
	);
}
