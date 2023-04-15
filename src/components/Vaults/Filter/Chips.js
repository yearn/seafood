import React from 'react';
import {BsStarFill} from 'react-icons/bs';
import {useFilter} from './useFilter';
import {Chip} from '../../controls';
import Network from './Network';
import VaultOptions from './VaultOptions';

export default function Chips() {
	const {chips, setChips} = useFilter();

	function toggle(chip) {
		return () => {
			setChips(chips => {
				return {...chips, [chip]: !chips[chip]};
			});
		};
	}

	return <div className={'flex flex-row items-center gap-3'}>
		<Chip icon={BsStarFill} onClick={toggle('favorites')} hot={chips.favorites} tall={true} />
		<Network />
		<VaultOptions />
	</div>;
}