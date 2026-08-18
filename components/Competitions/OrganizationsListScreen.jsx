import React from 'react';
import CompetitionList from './CompetitionList';
import { getOrganizationsUrl } from '../../helpers/apiConfig';

const OrganizationsListScreen = ({ navigation }) => (
	<CompetitionList
		title="Organizacje"
		emptyTitle="Brak lig"
		emptyDescription="Utwórz pierwszą organizację na webie, aby organizować sezony i turnieje."
		buildUrl={getOrganizationsUrl}
		detailRoute="OrganizationDetail"
		navigation={navigation}
	/>
);

export default OrganizationsListScreen;
