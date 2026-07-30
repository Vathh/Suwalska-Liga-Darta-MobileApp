import React from 'react';
import CompetitionList from './CompetitionList';
import { getLeaguesUrl } from '../../helpers/apiConfig';

const LeaguesListScreen = ({ navigation }) => (
	<CompetitionList
		title="Ligi"
		emptyTitle="Brak lig"
		emptyDescription="Utwórz pierwszą ligę na webie, aby organizować sezony i turnieje."
		buildUrl={getLeaguesUrl}
		detailRoute="LeagueDetail"
		navigation={navigation}
	/>
);

export default LeaguesListScreen;
