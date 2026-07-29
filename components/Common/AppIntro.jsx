import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';
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
 */
const AppIntro = ({ onDone }) => {
	const [html, setHtml] = useState(null);

	const finish = useCallback(() => {
		onDone?.();
	}, [onDone]);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const asset = Asset.fromModule(require('../../assets/intro-logotyp.svg'));
				await asset.downloadAsync();
				const uri = asset.localUri || asset.uri;
				const res = await fetch(uri);
				const svgXml = await res.text();
				if (cancelled) return;
				setHtml(buildIntroHtml(svgXml));
			} catch {
				if (!cancelled) finish();
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [finish]);

	useEffect(() => {
		if (!html) return undefined;
		const timer = setTimeout(finish, INTRO_DURATION_MS);
		return () => clearTimeout(timer);
	}, [html, finish]);

	return (
		<View style={styles.root}>
			{html ? (
				<WebView
					originWhitelist={['*']}
					source={{ html }}
					style={styles.webview}
					containerStyle={styles.webview}
					scrollEnabled={false}
					bounces={false}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					androidLayerType="hardware"
					setSupportMultipleWindows={false}
				/>
			) : null}
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
