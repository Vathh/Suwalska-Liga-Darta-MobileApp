import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Asset } from 'expo-asset'
import { SvgXml } from 'react-native-svg'
import { navigate, navigationRef } from '../../helpers/navigationRef'

/** Proporcje napis.svg ~1550×180 */
const WORDMARK_HEIGHT = 18
const WORDMARK_WIDTH = Math.round((1550 / 180) * WORDMARK_HEIGHT)

let cachedXml = null
let loadPromise = null

function loadBrandNapisXml() {
	if (cachedXml) {
		return Promise.resolve(cachedXml)
	}
	if (!loadPromise) {
		loadPromise = (async () => {
			const asset = Asset.fromModule(require('../../assets/brand-napis.svg'))
			await asset.downloadAsync()
			const res = await fetch(asset.localUri || asset.uri)
			cachedXml = await res.text()
			return cachedXml
		})()
	}
	return loadPromise
}

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

const HeaderTitle = () => {
	const [xml, setXml] = useState(cachedXml)

	useEffect(() => {
		if (xml) {
			return undefined
		}
		let cancelled = false
		loadBrandNapisXml()
			.then((value) => {
				if (!cancelled) {
					setXml(value)
				}
			})
			.catch(() => {})
		return () => {
			cancelled = true
		}
	}, [xml])

	return (
		<Pressable
			onPress={goToHome}
			hitSlop={8}
			accessibilityRole="button"
			accessibilityLabel="twentysix — strona główna"
			style={styles.wrap}
		>
			{xml ? (
				<SvgXml xml={xml} width={WORDMARK_WIDTH} height={WORDMARK_HEIGHT} />
			) : (
				<View style={styles.placeholder} />
			)}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	wrap: {
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingVertical: 4,
	},
	placeholder: {
		width: WORDMARK_WIDTH,
		height: WORDMARK_HEIGHT,
	},
})

export default HeaderTitle
