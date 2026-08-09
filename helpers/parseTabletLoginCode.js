/**
 * Wyciąga kod logowania tabletu z treści QR (URL HTTPS, deep link lub sam kod).
 *
 * @param {string} raw
 * @returns {string|null} znormalizowany kod lub null
 */
export function parseTabletLoginCode(raw) {
	const value = String(raw ?? '').trim();
	if (!value) return null;

	const fromPath = value.match(
		/(?:tablet-login\/|tournament-login\/)([A-Za-z0-9]+)/i,
	);
	if (fromPath?.[1]) {
		return fromPath[1].toUpperCase();
	}

	const queryMatch = value.match(
		/[?&](?:code|loginCode|tabletCode)=([A-Za-z0-9]+)/i,
	);
	if (queryMatch?.[1]) {
		return queryMatch[1].toUpperCase();
	}

	const bare = value.replace(/\s+/g, '');
	if (/^[A-Za-z0-9]{6,16}$/.test(bare)) {
		return bare.toUpperCase();
	}

	return null;
}
