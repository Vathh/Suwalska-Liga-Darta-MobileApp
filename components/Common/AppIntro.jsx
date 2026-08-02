import React, { useCallback, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import introSvgXml from '../../assets/introLogotypXml';
import { colors } from '../../theme/colors';

/** Czas animacji SVG (~2.5s) + krótki zapas przed przejściem do appki. */
const INTRO_DURATION_MS = 2900;

const BG = colors.bg || '#141418';

function buildIntroHtml(svgXml) {
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: ${BG};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    svg {
      width: min(72vw, 300px);
      height: auto;
      display: block;
    }
  </style>
</head>
<body>${svgXml}</body>
</html>`;
}

/**
 * Intro przy starcie: animowany logotyp (stroke reveal z easein-easeout.svg).
 *
 * SVG jest osadzone w bundlu (`introLogotypXml.js`), nie ładowane przez expo-asset + fetch —
 * na Androidzie w release APK asset URI często nie jest prawdziwym plikiem i intro znikało.
 */
const AppIntro = ({ onDone }) => {
	const finish = useCallback(() => {
		onDone?.();
	}, [onDone]);

	useEffect(() => {
		const timer = setTimeout(finish, INTRO_DURATION_MS);
		return () => clearTimeout(timer);
	}, [finish]);

	const html = buildIntroHtml(introSvgXml);

	return (
		<View style={styles.root}>
			<WebView
				originWhitelist={['*']}
				source={{
					html,
					// Android: bez baseUrl HTML bywa o `about:blank` i CSS animacje SVG bywają niestabilne.
					baseUrl: Platform.OS === 'android' ? 'https://twentysix.local/' : undefined,
				}}
				style={styles.webview}
				containerStyle={styles.webview}
				scrollEnabled={false}
				bounces={false}
				showsVerticalScrollIndicator={false}
				showsHorizontalScrollIndicator={false}
				androidLayerType="hardware"
				setSupportMultipleWindows={false}
				javaScriptEnabled={false}
				domStorageEnabled={false}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: BG,
	},
	webview: {
		flex: 1,
		backgroundColor: BG,
	},
});

export default AppIntro;
