import React, {useState} from 'react';
import {BsStar, BsStarFill} from 'react-icons/bs';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {useFavorites} from '../../context/useFavorites';
import {getAddressExplorer, highlightString, truncateAddress} from '../../utils/utils';
import Tile from './Tile';
import Panel from './Panel';
import Chip from './Chip';

export default function StrategyTile({selectedProvider, strategy, queryRe, onClick}) {
	const favorites = useFavorites();
	const [copied, setCopied] = useState(false);

	function toggleFavorite() {
		return () => {
			favorites.setStrategies(strategies => {
				const index = strategies.indexOf(strategy.address);
				if(index > -1) {
					strategies.splice(index, 1);
				} else {
					strategies.push(strategy.address);
				}
				return [...strategies];
			});
		};
	}

	function copyAddress(strategy) {
		return () => {
			try {
				navigator.clipboard.writeText(strategy.address);
			} finally {
				setCopied(true);
				setTimeout(() => {
					setCopied(false);
				}, 2500);
			}
		};
	}

	return <Tile>
		<div className={'grid grid-cols-4 gap-1 p-1'}>
			<Panel onClick={onClick} className={'col-span-4'} innserClassName={'flex flex-col'}>
				<div className={'text-lg font-bold truncate'}>{highlightString(strategy.name, queryRe)}</div>
				<div className={'flex'}>
					<div className={'mt-3 flex flex-col gap-2 items-start'}>
						<Chip label={'strategy'} className={'bg-pink-400 dark:bg-pink-800'} />
					</div>
				</div>
			</Panel>
			<Panel title={favorites.strategies.includes(strategy.address) ? 'Remove from favorites' : 'Add to favorites'} 
				onClick={toggleFavorite()} className={`
				p-4 h-14 flex items-center justify-center 
				text-sm rounded-lg`} innserClassName={'items-center justify-center'}>
				{!favorites.strategies.includes(strategy.address) && <>&nbsp;<BsStar />&nbsp;</>}
				{favorites.strategies.includes(strategy.address) && <>&nbsp;<BsStarFill className={'fill-attention-400 glow-attention-md'} />&nbsp;</>}
			</Panel>
			<Panel title={`Explore ${strategy.address}`}
				onClick={() => window.open(getAddressExplorer(selectedProvider.network.chainId, strategy.address), '_blank', 'noreferrer')} className={`
				col-span-2 shrink p-4 h-14 flex items-center justify-center 
				text-secondary-900 dark:text-secondary-500
				sm:dark:group-hover:text-secondary-200
				transition duration-200
				text-sm rounded-lg`} innserClassName={'items-center justify-center'}>
				{truncateAddress(strategy.address)}
			</Panel>
			<Panel title={`Copy ${strategy.address} to your clipboard`}
				onClick={copyAddress(strategy)}
				className={`
				p-4 h-14 flex items-center justify-center
				text-secondary-900 dark:text-secondary-500
				sm:dark:group-hover:text-secondary-200
				transition duration-200
				text-sm rounded-lg`} innserClassName={'items-center justify-center'}>
				{!copied && <TbCopy className={'text-lg'}></TbCopy>}
				{copied && <TbCheck className={'text-lg'}></TbCheck>}
			</Panel>
		</div>
	</Tile>;
}