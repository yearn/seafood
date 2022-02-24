import React, {useEffect, useState} from 'react';
import useRpcProvider from '../context/useRpcProvider';
import axios from '../axios';
import {BsBoxArrowInUpRight, BsClipboardPlus} from 'react-icons/bs';
import {GetExplorerLink, TruncateAddress} from '../utils/utils';
import {useDebouncedCallback} from 'use-debounce';

const curveRe = /urve|crv/i;

function useFetchVaults(provider) {
	const [result, setResult] = useState([]);
	useEffect(() => {
		(async () => {
			const response = await axios.post('api/getVaults/AllVaults', provider.network);
			setResult(response.data);
		})();
	}, [provider]);
	return result;
}

export default function Index() {
	const {defaultProvider, fantomProvider} = useRpcProvider();
	const ethereumVaults = useFetchVaults(defaultProvider);
	const fantomVaults = useFetchVaults(fantomProvider);
	const [vaults, setVaults] = useState([]);
	const [filter, setFilter] = useState([]);
	const [query, setQuery] = useState('');
	const debounceQuery = useDebouncedCallback(value => {setQuery(value);}, 250);
	const [chips, setChips] = useState({
		curve: true,
		ethereum: true,
		fantom: true
	});

	useEffect(() => {
		setVaults([
			...ethereumVaults.map(v => {
				v.network = 'Ethereum';
				v.provider = defaultProvider;
				return v;
			}),
			...fantomVaults.map(v => {
				v.network = 'Fantom';
				v.provider = fantomProvider;
				return v;
			})
		]);
	}, [defaultProvider, ethereumVaults, fantomProvider, fantomVaults]);

	useEffect(() => {
		const re = new RegExp(query, 'i');
		setFilter(vaults.filter(vault => {
			if(query && !re.test(vault.name)) return false;
			if(!chips.ethereum && vault.network === 'Ethereum') return false;
			if(!chips.fantom && vault.network === 'Fantom') return false;
			return chips.curve || !curveRe.test(vault.name);
		}));
	}, [query, chips, vaults]);

	return <div className={'vaults'}>
		<div className={'filter'}>
			<div className={'flex items-center'}>
				<input onChange={(e) => {debounceQuery(e.target.value);}} type={'text'} placeholder={'Filter by name..'} />
				<div onClick={() => {setChips({...chips, curve: !chips.curve});}} 
					className={`chip ${chips.curve ? 'hot' : ''}`}>{'Curve'}</div>
				<div onClick={() => {setChips({...chips, ethereum: !chips.ethereum});}} 
					className={`chip ${chips.ethereum ? 'hot' : ''}`}>{'Ethereum'}</div>
				<div onClick={() => {setChips({...chips, fantom: !chips.fantom});}} 
					className={`chip ${chips.fantom ? 'hot' : ''}`}>{'Fantom'}</div>
			</div>
			<div className={'text-2xl'}>
				{`${filter.length} Vaults`}
			</div>
		</div>
		<div className={'grid grid-flow-row grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-8'}>
			{filter.map(vault => {
				return <div key={vault.address} 
					className={'vault-tile'}>
					<div className={'title-button'}>
						<div className={'title'}>{vault.name}</div>
						<div className={'version'}>{vault.version}</div>
					</div>
					<div className={'flex items-center justify-between'}>
						<div className={'flex items-center address'}>
							{TruncateAddress(vault.address)}
							<BsClipboardPlus title={`Copy ${vault.address} to your clipboard`} onClick={() => navigator.clipboard.writeText(vault.address)} />
							<a href={GetExplorerLink(vault.provider.network.chainId, vault.address)} title={`Explore ${vault.address}`}><BsBoxArrowInUpRight /></a>
						</div>
						<div className={`network ${vault.network.toLowerCase()}`}>{vault.network}</div>
					</div>
				</div>;
			})}
		</div>
	</div>;
}