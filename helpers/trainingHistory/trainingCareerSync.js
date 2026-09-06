import { apiRequest } from '../apiClient';
import { TRAINING_GAMES_API_URL } from '../apiConfig';
import { dequeueOutbox, enqueueOutbox, peekOutbox } from '../gameScoring/scoringOutbox.js';
import { buildX01TrainingMetrics } from '../career/buildTrainingCareerMetrics';

const OUTBOX_KEY = 'training-career-outbox';

function metricsFromPlayerState(
	playerState,
	doubleStats,
	isPerDart,
	gameType,
	extras,
) {
	if (gameType && gameType !== 'x01') {
		return extras?.metrics ?? {
			player_id: extras?.playerId,
			dart_log: extras?.eventLog ?? [],
			board: extras?.board,
			won: extras?.won,
			score: extras?.score,
			bob27_mode: extras?.bob27Mode,
			bob27_bull: extras?.bob27Bull,
			includeBull: extras?.includeBull,
		};
	}
	return buildX01TrainingMetrics(
		playerState,
		doubleStats,
		isPerDart,
		extras?.visitLog,
		extras?.playerIndex,
	);
}

export async function enqueueTrainingCareerSync(entry) {
	await enqueueOutbox(OUTBOX_KEY, { op: 'trainingGame', payload: entry });
}

export async function flushTrainingCareerOutbox(accessToken) {
	if (!accessToken) {
		return;
	}
	let next = await peekOutbox(OUTBOX_KEY);
	while (next?.payload) {
		const { ok } = await apiRequest(TRAINING_GAMES_API_URL, {
			method: 'POST',
			accessToken,
			json: true,
			body: next.payload,
		});
		if (!ok) {
			return;
		}
		await dequeueOutbox(OUTBOX_KEY);
		next = await peekOutbox(OUTBOX_KEY);
	}
}

/**
 * Wysyła statystyki slota JA (albo kolejkuje offline).
 */
export async function syncTrainingCareerIfNeeded({
	players,
	playerStates,
	matchFormat,
	gameType,
	clientUuid,
	completedAt,
	doubleStatsByIndex,
	isPerDart,
	accessToken,
	eventLog = null,
	visitLog = null,
	selfExtras = null,
}) {
	const idx = (players ?? []).findIndex(
		(p) => p?.isSelf && p?.accountPlayerId != null,
	);
	if (idx < 0 || !accessToken) {
		return;
	}
	const extras = {
		playerIndex: idx,
		visitLog,
		eventLog,
		playerId: players[idx]?.accountPlayerId ?? players[idx]?.playerId,
		...(selfExtras ?? {}),
	};
	const metrics = metricsFromPlayerState(
		playerStates?.[idx],
		doubleStatsByIndex?.[idx],
		isPerDart,
		gameType || 'x01',
		extras,
	);
	if (!metrics) {
		return;
	}
	const payload = {
		clientUuid,
		gameType: gameType || 'x01',
		completedAt,
		format: matchFormat ?? null,
		metrics,
	};
	const { ok } = await apiRequest(TRAINING_GAMES_API_URL, {
		method: 'POST',
		accessToken,
		json: true,
		body: payload,
	});
	if (!ok) {
		await enqueueTrainingCareerSync(payload);
	}
}
