import React from 'react';
import CompetitionList from './CompetitionList';
import { getTournamentsUrl } from '../../helpers/apiConfig';

const TournamentsListScreen = ({ navigation }) => (
	<CompetitionList
		title="Turnieje"
		emptyTitle="Brak turniejów"
		emptyDescription="Turnieje pojawią się po utworzeniu ich na webie."
		buildUrl={getTournamentsUrl}
		detailRoute="TournamentDetail"
		navigation={navigation}
	/>
);

export default TournamentsListScreen;
