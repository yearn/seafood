import React, {useEffect, useState} from 'react';
import {BsBoxArrowInUpRight, BsClipboardPlus} from 'react-icons/bs';
import {GetExplorerLink, TruncateAddress} from '../utils/utils';
import {useDebouncedCallback} from 'use-debounce';
import {useApp} from '../context/useApp';

const curveRe = /curve|crv/i;

export default function Index() {
	const {vaults} = useApp();
	const [filter, setFilter] = useState([]);
	const [query, setQuery] = useState('');
	const debounceQuery = useDebouncedCallback(value => {setQuery(value);}, 250);
	const [chips, setChips] = useState({
		curve: true,
		ethereum: true,
		fantom: true
	});

	useEffect(() => {
		const re = new RegExp(query, 'i');
		setFilter(vaults.filter(vault => {
			if(query && !re.test(vault.name)) return false;
			if(!chips.ethereum && vault.provider.network.name === 'ethereum') return false;
			if(!chips.fantom && vault.provider.network.name === 'fantom') return false;
			return chips.curve || !curveRe.test(vault.name);
		}));
	}, [query, chips, vaults]);

	function chip(tag) {
		return <div onClick={() => {setChips({...chips, [tag]: !chips[tag]});}} 
			className={`chip-${tag} chip ${chips[tag] ? ` hot-${tag}` : ''}`}>{tag}</div>;
	}

	function styledTitle(title) {
		const match = title.match(curveRe);
		if (match) {
			const matchedText = match[0];
			const left = title.substring(0, match.index);
			const middle = title.substring(match.index, match.index + matchedText.length);
			const right = title.substring(match.index + matchedText.length);
			return <>
				{left}
				<span className={'curve-text'}>{middle}</span>
				{right}
			</>;
		}

		return title;
	}

	return <div className={'vaults'}>
		<div className={'filter'}>
			<div className={'flex items-center'}>
				<input onChange={(e) => {debounceQuery(e.target.value);}} type={'text'} placeholder={'Filter by name..'} />
				{chip('curve')}
				{chip('ethereum')}
				{chip('fantom')}
			</div>
			<div className={'text-2xl'}>
				{`${filter.length} Vaults`}
			</div>
		</div>
		<div className={'list'}>
			{filter.map(vault => {
				return <div key={vault.address} className={'tile'}>
					<div className={'title-button'}>
						<div className={'title'}>{styledTitle(vault.name)}</div>
						<div className={'version'}>{vault.version}</div>
					</div>
					<div className={'flex items-center justify-between'}>
						<div className={'flex items-center address'}>
							{TruncateAddress(vault.address)}
							<BsClipboardPlus title={`Copy ${vault.address} to your clipboard`} onClick={() => navigator.clipboard.writeText(vault.address)} />
							<a href={GetExplorerLink(vault.provider.network.chainId, vault.address)} title={`Explore ${vault.address}`}><BsBoxArrowInUpRight /></a>
						</div>
						<div className={`network ${vault.provider.network.name}`}>{vault.provider.network.name}</div>
					</div>
				</div>;
			})}
		</div>
	</div>;
}