import React, {useEffect, useState} from 'react';
import useKeypress from 'react-use-keypress';
import {useApp} from '../../context/useApp';
import {curveRe} from '../../utils/utils';

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
		<div onClick={close} className={'absolute -z-10 inset-0'}></div>
		<div className={'dialog'}>
			<div className={'grid grid-flow-row grid-cols-1 md:grid-cols-3 2xl:grid-cols-4'}>
				{filter.map(vault => {
					return <div key={vault.address}>{vault.name}</div>;
				})}
			</div>
			<button onClick={close}>{'Close'}</button>
		</div>
	</div>;
}