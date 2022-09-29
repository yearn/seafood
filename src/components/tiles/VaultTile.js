import React, {useState} from 'react';
import {BsStar, BsStarFill} from 'react-icons/bs';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {useApp} from '../../context/useApp';
import {getAddressExplorer, highlightString, truncateAddress} from '../../utils/utils';
import {Bone} from '../controls';
import Tile from './Tile';
import Panel from './Panel';
import Chip from './Chip';
import Sparkline from './Sparkline';

export default function VaultTile({vault, queryRe, onClick}) {
	const {favorites} = useApp();
	const [copied, setCopied] = useState(false);

	function toggleFavorite(vault) {
		return () => {
			favorites.setVaults(vaults => {
				const index = vaults.indexOf(vault.address);
				if(index > -1) {
					vaults.splice(index, 1);
				} else {
					vaults.push(vault.address);
				}
				return [...vaults];
			});
		};
	}

	function copyAddress(vault) {
		return () => {
			try {
				navigator.clipboard.writeText(vault.address);
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
			<div className={'text-lg font-bold'}>{highlightString(vault.name, queryRe)}</div>
			<div className={'flex'}>
				<div className={'mt-3 flex flex-col gap-2 items-start'}>
					<div className={'flex gap-2 items-center'}>
						<Chip label={vault.version} className={'bg-primary-400 dark:bg-primary-900'} />
						<Chip label={vault.network.name} className={`bg-${vault.network.name}`} />
					</div>
					<div className={`
						w-36 text-sm -mr-[10px]
						text-secondary-900 dark:text-secondary-500
						sm:dark:group-hover:text-secondary-200
						transition duration-200`}>
						{!vault.strategies && <div>
							<div><Bone></Bone></div>
							<div><Bone></Bone></div>
							<div><Bone></Bone></div>
						</div>}
						{vault.strategies && <div>
							<div>{vault.strategies.length + ' Strategies'}</div>
							<div>{(vault.debtRatio / 100).toLocaleString(undefined, {maximumFractionDigits:2})}{'% Allocated'}</div>
							<div>{((vault.totalAssets - vault.totalDebt) / (10 ** vault.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}{' Free'}</div>
						</div>}
					</div>
				</div>
				<div className={`
					relative grow flex
					text-secondary-900 dark:text-secondary-500
					transition duration-200
					sm:dark:group-hover:text-secondary-200`}>
					{vault.strategies && <Sparkline />}
					{vault.strategies && <div className={`
						absolute bottom-0 right-0 
						px-2 py-1 text-xs capitalize rounded
						backdrop-blur-sm
						rounded-full`}>{'TVL ???'}</div>}
				</div>
			</div>
		</Panel>
		<div className={`
			flex items-center justify-between
			text-secondary-900 dark:text-secondary-500
			sm:dark:group-hover:text-secondary-200`}>
			<Panel title={favorites.vaults.includes(vault.address) ? 'Remove from favorites' : 'Add to favorites'} 
				onClick={toggleFavorite(vault)} className={`
				p-4 h-14 flex items-center justify-center 
				text-sm basis-1/4 rounded-bl-lg`} >
				{!favorites.vaults.includes(vault.address) && <>&nbsp;<BsStar />&nbsp;</>}
				{favorites.vaults.includes(vault.address) && <>&nbsp;<BsStarFill className={'fill-attention-400 glow-attention-md'} />&nbsp;</>}
			</Panel>
			<Panel title={`Explore ${vault.address}`} 
				onClick={() => window.open(getAddressExplorer(vault.network.chainId, vault.address), '_blank', 'noreferrer')} className={`
				p-4 h-14 flex items-center justify-center 
				text-sm basis-1/2`} >
				{truncateAddress(vault.address)}
			</Panel>
			<Panel title={`Copy ${vault.address} to your clipboard`}
				onClick={copyAddress(vault)}
				className={`
				p-4 h-14 flex items-center justify-center 
				text-sm basis-1/4 rounded-br-lg`}>
				{!copied && <TbCopy className={'text-lg'}></TbCopy>}
				{copied && <TbCheck className={'text-lg'}></TbCheck>}
			</Panel>
		</div>
	</Tile>;
}