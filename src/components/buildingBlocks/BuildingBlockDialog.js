import React, {useEffect, useState} from 'react';
import useKeypress from 'react-use-keypress';
import {useApp} from '../../context/useApp';
import {curveRe} from '../../utils/utils';
import Tile from '../Vaults/Tile';
import {FilterProvider} from '../Vaults/useFilter';
import '../Vaults/index.css';
import Filter from '../Vaults/Filter';

export default function BuildingBlockDialog({state, setState}) {
	const {vaults} = useApp();
	const [filter, setFilter] = useState([]);
	const [curve] = useState(false);
	useKeypress(['Escape'], close);

	useEffect(() => {
		setFilter(vaults.filter(vault => {
			if(vault.provider.chainId != state.provider.chainId) return false;
			return curve || !curveRe.test(vault.name);
		}));
	}, [state, vaults, curve]);

	function close() {
		setState(state => {
			return {...state, show: false};
		});
	}

	return <div className={`dialog-container${state.show ? '' : ' invisible'}`}>
		<div className={'dialog'}>
			<FilterProvider>
				<div className={''}>
					<Filter></Filter>
				</div>
				<div className={'max-h-full overflow-scroll my-2 grid grid-flow-row grid-cols-1 md:grid-cols-3 2xl:grid-cols-4'}>
					{filter.map(vault => {
						return <Tile key={vault.address} vault={vault}></Tile>;
					})}
				</div>
			</FilterProvider>
			<button onClick={close}>{'Close'}</button>
		</div>
		<div onClick={close} className={'absolute -z-10 inset-0'}></div>
	</div>;
}