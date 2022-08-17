import React, {useState} from 'react';
import {BsStar, BsStarFill} from 'react-icons/bs';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {useApp} from '../../context/useApp';
import {getAddressExplorer, highlightString, truncateAddress} from '../../utils/utils';
import Tile from './Tile';
import Panel from './Panel';
import Chip from './Chip';

export default function StrategyTile({strategy, queryRe, onClick}) {
	const {selectedProvider} = useSelectedProvider();
	const {favorites} = useApp();
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
		<Panel onClick={onClick} className={'px-4 pt-4 pb-4 flex flex-col rounded-tl-lg rounded-tr-lg'}>
			<div className={'text-lg font-bold'}>{highlightString(strategy.name, queryRe)}</div>
			<div className={'flex'}>
				<div className={'mt-3 flex flex-col gap-2 items-start'}>
					<Chip label={'strategy'} className={'bg-pink-400 dark:bg-pink-800'} />
				</div>
			</div>
		</Panel>
		<div className={`
			flex items-center justify-between
			text-secondary-900 dark:text-secondary-500
			dark:group-hover:text-secondary-200`}>
			<Panel title={favorites.strategies.includes(strategy.address) ? 'Remove from favorites' : 'Add to favorites'} 
				onClick={toggleFavorite()} className={`
				p-4 h-14 flex items-center justify-center 
				text-sm basis-1/4 rounded-bl-lg`} >
				{!favorites.strategies.includes(strategy.address) && <>&nbsp;<BsStar />&nbsp;</>}
				{favorites.strategies.includes(strategy.address) && <>&nbsp;<BsStarFill className={'fill-attention-400 glow-attention-md'} />&nbsp;</>}
			</Panel>
			<Panel title={`Explore ${strategy.address}`}
				onClick={() => window.open(getAddressExplorer(selectedProvider.network.chainId, strategy.address), '_blank', 'noreferrer')} className={`
				p-4 h-14 flex items-center justify-center 
				text-sm basis-1/2`} >
				{truncateAddress(strategy.address)}
			</Panel>
			<Panel title={`Copy ${strategy.address} to your clipboard`}
				onClick={copyAddress(strategy)}
				className={`
				p-4 h-14 flex items-center justify-center 
				text-sm basis-1/4 rounded-br-lg`}>
				{!copied && <TbCopy className={'text-lg'}></TbCopy>}
				{copied && <TbCheck className={'text-lg'}></TbCheck>}
			</Panel>
		</div>
	</Tile>;
}