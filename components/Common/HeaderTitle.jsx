import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { SvgXml } from 'react-native-svg'
import brandNapisXml from '../../assets/brandNapisXml'
import { navigate, navigationRef } from '../../helpers/navigationRef'

/** Proporcje napis.svg ~1550×180 */
const WORDMARK_HEIGHT = 18
const WORDMARK_WIDTH = Math.round((1550 / 180) * WORDMARK_HEIGHT)

function rootHasRoute(state, name) {
	if (!state?.routes) {
		return false
	}
	return state.routes.some(
		(route) => route.name === name || rootHasRoute(route.state, name),
	)
}

function goToHome() {
	if (!navigationRef.current?.isReady()) {
		return
	}
	const root = navigationRef.current.getRootState()
	if (rootHasRoute(root, 'MainTabs')) {
		navigate('MainTabs', { screen: 'Home' })
		return
	}
	if (rootHasRoute(root, 'Home')) {
		navigate('Home')
		return
	}
	if (rootHasRoute(root, 'GameList')) {
		navigate('GameList')
	}
}

/**
 * Wordmark w headerze. SVG jest osadzone w bundlu (`brandNapisXml.js`),
 * nie przez expo-asset + fetch — na Androidzie w release APK URI assetu
 * często nie jest prawdziwym plikiem (ten sam problem co przy intro).
 */
const HeaderTitle = () => {
	return (
		<Pressable
			onPress={goToHome}
			hitSlop={8}
			accessibilityRole="button"
			accessibilityLabel="twentysix — strona główna"
			style={styles.wrap}
		>
			<SvgXml xml={brandNapisXml} width={WORDMARK_WIDTH} height={WORDMARK_HEIGHT} />
		</Pressable>
	)
}

const styles = StyleSheet.create({
	wrap: {
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingVertical: 4,
	},
})

export default HeaderTitle
