import React from 'react';
import {FilterProvider} from './useFilter';
import List from './List';
import Filter from './Filter';
import './index.css';

export default function Vaults() {
	return <FilterProvider>
		<Filter></Filter>
		<List />
	</FilterProvider>;
}