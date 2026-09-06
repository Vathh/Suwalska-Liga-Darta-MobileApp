import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@twentysix/trainingPlayers';
const MAX_PLAYERS = 8;

export function displayTrainingPlayerName(player) {
	if (!player) return '';
	const name = (player.name ?? '').trim();
	if (player.isSelf) {
		return name ? `${name} – JA` : 'JA';
	}
	return name;
}

export function makeSelfTrainingPlayer(auth) {
	if (!auth?.playerId) return null;
	return {
		id: `self-${auth.playerId}`,
		name: (auth.playerName ?? 'Ja').trim() || 'Ja',
		isSelf: true,
		accountPlayerId: Number(auth.playerId),
	};
}

function normalizeStoredPlayer(item, index, now) {
	if (typeof item === 'string') {
		const name = item.trim();
		return name ? { id: now + index, name, isSelf: false, accountPlayerId: null } : null;
	}
	if (!item || typeof item !== 'object') {
		return null;
	}
	const name = typeof item.name === 'string' ? item.name.trim() : '';
	if (!name && !item.isSelf) {
		return null;
	}
	return {
		id: item.id ?? now + index,
		name: name || 'Ja',
		isSelf: !!item.isSelf,
		accountPlayerId: item.accountPlayerId != null ? Number(item.accountPlayerId) : null,
	};
}

/**
 * @returns {Promise<Array<{ id: number|string, name: string, isSelf?: boolean, accountPlayerId?: number|null }>>}
 */
export async function loadPersistedTrainingPlayers() {
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		const now = Date.now();
		return parsed
			.map((item, i) => normalizeStoredPlayer(item, i, now))
			.filter(Boolean)
			.slice(0, MAX_PLAYERS);
	} catch {
		return [];
	}
}

/**
 * @param {Array<{ name?: string, isSelf?: boolean, accountPlayerId?: number } | string>} players
 */
export async function savePersistedTrainingPlayers(players) {
	try {
		const list = (Array.isArray(players) ? players : [])
			.map((item) => {
				if (typeof item === 'string') {
					const name = item.trim();
					return name ? { name, isSelf: false, accountPlayerId: null } : null;
				}
				const name = item?.name?.trim?.() ?? '';
				if (!name && !item?.isSelf) return null;
				return {
					name: name || 'Ja',
					isSelf: !!item.isSelf,
					accountPlayerId: item.accountPlayerId != null ? Number(item.accountPlayerId) : null,
				};
			})
			.filter(Boolean)
			.slice(0, MAX_PLAYERS);
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	} catch (e) {
		console.warn('persistTrainingPlayers save failed', e);
	}
}

export function dropStaleSelfSlots(players, accountPlayerId) {
	const pid = accountPlayerId != null ? Number(accountPlayerId) : null;
	return (players ?? []).filter((p) => {
		if (!p?.isSelf) return true;
		if (pid == null) return false;
		return Number(p.accountPlayerId) === pid;
	});
}
