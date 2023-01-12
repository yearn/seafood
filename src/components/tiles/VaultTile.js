import React, {useState} from 'react';
import {BsStar, BsStarFill} from 'react-icons/bs';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {useFavorites} from '../../context/useFavorites';
import {formatNumber, formatPercent, getAddressExplorer, highlightString, truncateAddress} from '../../utils/utils';
import {LabeledNumber} from '../controls';
import Tile from './Tile';
import Panel from './Panel';
import Chip from './Chip';
import VaultTvl from './VaultTvl';

export default function VaultTile({vault, queryRe, onClick}) {
	const favorites = useFavorites();
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
		<div className={'grid grid-cols-4 gap-1'}>
			<Panel onClick={onClick} className={'col-span-4'}>
				<div className={'w-full flex flex-col'}>
					<div className={'text-lg font-bold truncate'}>{highlightString(vault.name, queryRe)}</div>
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
								<div>
									<LabeledNumber number={vault.withdrawalQueue.length} label={'Strategies'} />
									<LabeledNumber number={formatPercent(vault.debtRatio / 10_000, 0)} label={'Allocated'} />
									<LabeledNumber number={formatNumber((vault.totalAssets - vault.totalDebt) / (10 ** vault.decimals), 0, '--', true)} label={'Free'} />
								</div>
							</div>
						</div>
						<div className={`
							relative grow flex
							transition duration-200`}>
							{vault.withdrawalQueue && <VaultTvl vault={vault} animate={true} />}
						</div>
					</div>
				</div>
			</Panel>
			<Panel title={favorites.vaults.includes(vault.address) ? 'Remove from favorites' : 'Add to favorites'} 
				onClick={toggleFavorite(vault)} 
				className={'p-4 h-14 text-sm'} innserClassName={'items-center justify-center'}>
				{!favorites.vaults.includes(vault.address) && <>&nbsp;<BsStar className={`
					dark:fill-secondary-500 sm:dark:group-hover:fill-secondary-200 
					transition duration-200`} />&nbsp;</>}
				{favorites.vaults.includes(vault.address) && <>&nbsp;<BsStarFill className={`
					fill-attention-400 glow-attention-md`} />&nbsp;</>}
			</Panel>
			<Panel title={`Explore ${vault.address}`} 
				onClick={() => window.open(getAddressExplorer(vault.network.chainId, vault.address), '_blank', 'noreferrer')} className={`
				col-span-2 shrink p-4 h-14
				text-secondary-900 dark:text-secondary-500
				sm:dark:group-hover:text-secondary-200
				transition duration-200
				text-sm`} innserClassName={'items-center justify-center'}>
				{truncateAddress(vault.address)}
			</Panel>
			<Panel title={`Copy ${vault.address} to your clipboard`}
				onClick={copyAddress(vault)}
				className={`
				p-4 h-14
				text-secondary-900 dark:text-secondary-500
				sm:dark:group-hover:text-secondary-200
				transition duration-200
				text-sm`} innserClassName={'items-center justify-center'}>
				{!copied && <TbCopy className={'text-lg'}></TbCopy>}
				{copied && <TbCheck className={'text-lg'}></TbCheck>}
			</Panel>
		</div>
	</Tile>;
}