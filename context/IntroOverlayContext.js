import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const IntroOverlayContext = createContext({
	introActive: false,
	revealRest: false,
	headerTarget: null,
	reportHeaderLogoLayout: () => {},
	reportRevealComplete: () => {},
});

export function IntroOverlayProvider({
	children,
	introActive,
	revealRest,
	onRevealComplete,
}) {
	const [headerTarget, setHeaderTarget] = useState(null);

	const reportHeaderLogoLayout = useCallback((rect) => {
		if (
			!rect ||
			typeof rect.x !== 'number' ||
			typeof rect.y !== 'number' ||
			!(rect.width > 0) ||
			!(rect.height > 0)
		) {
			return;
		}
		setHeaderTarget((prev) => {
			if (
				prev &&
				prev.x === rect.x &&
				prev.y === rect.y &&
				prev.width === rect.width &&
				prev.height === rect.height
			) {
				return prev;
			}
			return rect;
		});
	}, []);

	const reportRevealComplete = useCallback(() => {
		onRevealComplete?.();
	}, [onRevealComplete]);

	const value = useMemo(
		() => ({
			introActive: !!introActive,
			revealRest: !!revealRest,
			headerTarget,
			reportHeaderLogoLayout,
			reportRevealComplete,
		}),
		[
			introActive,
			revealRest,
			headerTarget,
			reportHeaderLogoLayout,
			reportRevealComplete,
		],
	);

	return (
		<IntroOverlayContext.Provider value={value}>
			{children}
		</IntroOverlayContext.Provider>
	);
}

export function useIntroOverlay() {
	return useContext(IntroOverlayContext);
}
