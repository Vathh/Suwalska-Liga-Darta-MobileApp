import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

/** Pełnoekranowy spinner — zawsze na środku widoku. */
const ScreenLoading = () => (
	<View style={styles.wrap}>
		<ActivityIndicator size="large" color={colors.accent} />
	</View>
);

const styles = StyleSheet.create({
	wrap: {
		flex: 1,
		backgroundColor: colors.bg,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default ScreenLoading;
