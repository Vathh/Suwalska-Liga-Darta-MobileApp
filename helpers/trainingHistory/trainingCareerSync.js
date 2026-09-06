import { apiRequest } from '../apiClient';
import { TRAINING_GAMES_API_URL } from '../apiConfig';
import { dequeueOutbox, enqueueOutbox, peekOutbox } from '../gameScoring/scoringOutbox.js';

const OUTBOX_KEY = 'training-career-outbox';

function metricsFromPlayerState(playerState, doubleStats, isPerDart) {
	const darts = Number(playerState?.totalDartsThrown ?? playerState?.dartsThrown ?? 0);
	const points = Number(playerState?.totalPointsEarned ?? 0);
	const tracked = !!isPerDart && (doubleStats?.attempts ?? 0) >= 0;
	return {
		darts_thrown: Number.isFinite(darts) ? darts : 0,
		points: Number.isFinite(points) ? points : 0,
		double_tracked: tracked,
		double_attempts: tracked ? (doubleStats?.attempts ?? 0) : null,
		double_successes: tracked ? (doubleStats?.successes ?? 0) : null,
	};
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
}) {
	const idx = (players ?? []).findIndex(
		(p) => p?.isSelf && p?.accountPlayerId != null,
	);
	if (idx < 0 || !accessToken) {
		return;
	}
	const payload = {
		clientUuid,
		gameType: gameType || 'x01',
		completedAt,
		format: matchFormat ?? null,
		metrics: metricsFromPlayerState(
			playerStates?.[idx],
			doubleStatsByIndex?.[idx],
			isPerDart,
		),
	};
	if ((payload.metrics.darts_thrown ?? 0) <= 0 && !payload.metrics.double_tracked) {
		return;
	}
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
