import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

/** Placeholder strony głównej po zalogowaniu — treść do uzupełnienia później. */
const HomeDashboard = () => {
	return <View style={styles.container} />;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg,
	},
});

export default HomeDashboard;
