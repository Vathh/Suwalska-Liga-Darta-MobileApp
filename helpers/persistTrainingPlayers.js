import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@twentysix/trainingPlayers';
const MAX_PLAYERS = 8;

/**
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export async function loadPersistedTrainingPlayers() {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		const names = parsed
			.map((item) => {
				if (typeof item === 'string') return item.trim();
				if (item && typeof item.name === 'string') return item.name.trim();
				return '';
			})
			.filter(Boolean)
			.slice(0, MAX_PLAYERS);
		const now = Date.now();
		return names.map((name, i) => ({ id: now + i, name }));
	} catch {
		return [];
	}
}

/**
 * @param {Array<{ name?: string } | string>} players
 */
export async function savePersistedTrainingPlayers(players) {
	try {
		const names = (Array.isArray(players) ? players : [])
			.map((item) => {
				if (typeof item === 'string') return item.trim();
				if (item && typeof item.name === 'string') return item.name.trim();
				return '';
			})
			.filter(Boolean)
			.slice(0, MAX_PLAYERS);
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(names));
	} catch (e) {
		console.warn('persistTrainingPlayers save failed', e);
	}
}
