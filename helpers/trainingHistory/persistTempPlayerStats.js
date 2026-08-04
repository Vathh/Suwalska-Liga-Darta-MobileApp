import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@twentysix/tempPlayerStats';

export async function loadTempPlayerStatsMap() {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const map = JSON.parse(raw);
		return map && typeof map === 'object' ? map : {};
	} catch {
		return {};
	}
}

export async function getTempPlayerStats(name) {
	const key = normalizeNameKey(name);
	if (!key) return null;
	const map = await loadTempPlayerStatsMap();
	return map[key] ?? null;
}

export async function removeTempPlayerStats(name) {
	const key = normalizeNameKey(name);
	if (!key) return;
	try {
		const map = await loadTempPlayerStatsMap();
		if (!(key in map)) return;
		delete map[key];
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
	} catch (e) {
		console.warn('tempPlayerStats remove failed', e);
	}
}

/**
 * Aktualizuje karierę lokalnych graczy na podstawie zapisanego meczu treningowego.
 */
export async function applyTrainingGameToTempPlayerStats(game) {
	if (!game?.players?.length) return;
	try {
		const map = await loadTempPlayerStatsMap();
		const winnerKey = normalizeNameKey(game.winnerName);

		for (const p of game.players) {
			const key = normalizeNameKey(p.name);
			if (!key) continue;
			const prev = map[key] ?? emptyCareer(p.name);
			const counts = p.checkoutDartCounts ?? { 1: 0, 2: 0, 3: 0 };
			map[key] = {
				name: p.name.trim(),
				games: (prev.games ?? 0) + 1,
				wins: (prev.wins ?? 0) + (key === winnerKey ? 1 : 0),
				legsWon: (prev.legsWon ?? 0) + (p.legsWon ?? 0),
				setsWon: (prev.setsWon ?? 0) + (p.setsWon ?? 0),
				totalPointsEarned:
					(prev.totalPointsEarned ?? 0) + (p.totalPointsEarned ?? 0),
				totalDartsThrown:
					(prev.totalDartsThrown ?? 0) + (p.totalDartsThrown ?? 0),
				plus60: (prev.plus60 ?? 0) + (p.plus60 ?? 0),
				plus80: (prev.plus80 ?? 0) + (p.plus80 ?? 0),
				plus100: (prev.plus100 ?? 0) + (p.plus100 ?? 0),
				plus140: (prev.plus140 ?? 0) + (p.plus140 ?? 0),
				max180: (prev.max180 ?? 0) + (p.max180 ?? 0),
				checkoutDart1: (prev.checkoutDart1 ?? 0) + (counts[1] ?? 0),
				checkoutDart2: (prev.checkoutDart2 ?? 0) + (counts[2] ?? 0),
				checkoutDart3: (prev.checkoutDart3 ?? 0) + (counts[3] ?? 0),
				updatedAt: new Date().toISOString(),
			};
		}

		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
	} catch (e) {
		console.warn('tempPlayerStats apply failed', e);
	}
}

function normalizeNameKey(name) {
	return (name ?? '').trim().toLowerCase();
}

function emptyCareer(name) {
	return {
		name: (name ?? '').trim(),
		games: 0,
		wins: 0,
		legsWon: 0,
		setsWon: 0,
		totalPointsEarned: 0,
		totalDartsThrown: 0,
		plus60: 0,
		plus80: 0,
		plus100: 0,
		plus140: 0,
		max180: 0,
		checkoutDart1: 0,
		checkoutDart2: 0,
		checkoutDart3: 0,
	};
}
