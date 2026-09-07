export function ffaSessionStatus(state) {
	return state?.session?.status ?? state?.game?.status ?? state?.meta?.status ?? null;
}

export function isFfaAbortedState(state) {
	return ffaSessionStatus(state) === 'aborted';
}

export function isFfaFinishedState(state) {
	return ffaSessionStatus(state) === 'finished';
}

/**
 * @returns {boolean} true gdy payload oznacza skasowaną grę — przerwij dalsze apply.
 */
export function consumeFfaAbortPayload(state, { setGameClosed, onAborted, handledRef }) {
	if (!isFfaAbortedState(state)) {
		return false;
	}
	if (!handledRef.current) {
		handledRef.current = true;
		setGameClosed(true);
		onAborted?.();
	}
	return true;
}

