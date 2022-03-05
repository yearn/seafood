import React from 'react';
import {FilterProvider} from './useFilter';
import Header from './Header';
import List from './List';
import './index.css';

export default function Vaults() {
	return <div className={'vaults'}>
		<FilterProvider>
			<Header></Header>
			<List />
		</FilterProvider>
	</div>;
}