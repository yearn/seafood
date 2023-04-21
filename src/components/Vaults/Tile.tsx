import React, {ReactNode, useCallback, useMemo, useState} from 'react';
import {BigNumber} from 'ethers';
import {Vault} from '../../context/useVaults/types';
import {useFilter} from './Filter/useFilter';
import {Row} from '../controls';
import {Bps, Field, Percentage, Tokens} from '../controls/Fields';
import {formatNumber, getAddressExplorer, highlightString, truncateAddress} from '../../utils/utils';
import {BsStar, BsStarFill} from 'react-icons/bs';
import {TbCheck, TbCopy} from 'react-icons/tb';
import {useFavorites} from '../../context/useFavorites';
import {useBlocks} from '../../context/useSimulator/BlocksProvider';
import {useSimulator} from '../../context/useSimulator';
import {useApyProbeDelta, useApyProbeResults} from '../../context/useSimulator/ProbesProvider/useApyProbe';

function Chip({className, children}: {className: string, children: ReactNode}) {
	return <div className={`
		px-2 py-1 ${className}
		group-hover:border-selected-500 group-hover:bg-selected-500
		group-active:border-selected-600 group-active:bg-selected-600 group-active:text-black
		group-hover:text-black`}>
		{children}
	</div>;
}

function getTvlSeries(vault: Vault) {
	if(!vault.tvls?.tvls?.length) return [];
	return [vault.tvls.dates.slice(-3), vault.tvls.tvls.slice(-3)][1];
}

function Minibars({vault}: {vault: Vault}) {
	const series = getTvlSeries(vault);
	const maxBar = 100;
	const maxSeries = Math.max(...series);
	const scale = maxBar / maxSeries;
	const bars = series.map(tvl => Math.round(scale * tvl) || 1);
	return <div className={'h-[20px] flex items-end gap-1'}>
		{bars.map((bar, index) => <div key={index} className={`
			w-2 h-[${bar}%]
			bg-secondary-600 group-hover:bg-selected-500 group-active:bg-selected-700
			dark:bg-secondary-200 dark:group-hover:bg-selected-400 dark:group-active:bg-selected-600`} />)}
	</div>;
}

function TileButton({
	onClick,
	selected,
	className,
	children
}: {
	onClick: () => void,
	selected?: boolean,
	className: string,
	children?: ReactNode
}) {
	return <div onClick={onClick} className={`
	group relative
	border ${selected ? 'border-primary-400 dark:border-primary-600' : 'border-transparent'}
	hover:border-selected-500 hover:text-selected-500
	active:border-selected-700 active:text-selected-700
	dark:hover:border-selected-400 dark:hover:text-selected-400
	dark:active:border-selected-600 dark:active:text-selected-600
	cursor-pointer ${className}`}>{children}</div>;
}

function FavoriteButton({vault, selected, className}: {vault: Vault, selected: boolean, className: string}) {
	const favorites = useFavorites();

	const toggle = useCallback(() => {
		const addresses = [...favorites.vaults];
		const index = addresses.indexOf(vault.address);
		if(index > -1) {
			addresses.splice(index, 1);
		} else {
			addresses.push(vault.address);
		}
		favorites.setVaults(addresses);
	}, [vault, favorites]);

	return <TileButton onClick={toggle} selected={selected} className={className}>
		{!favorites.vaults.includes(vault.address) && <BsStar />}
		{favorites.vaults.includes(vault.address) && <BsStarFill className={'fill-attention-400 glow-attention-md'} />}
	</TileButton>;
}

function CopyButton({clip, selected, className}: {clip: string, selected: boolean, className: string}) {
	const [copied, setCopied] = useState(false);

	const copy = useCallback(() => {
		try {
			navigator.clipboard.writeText(clip);
		} finally {
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 2500);
		}
	}, [clip, setCopied]);

	return <TileButton onClick={copy} selected={selected} className={className}>
		{!copied && <TbCopy />}
		{copied && <TbCheck />}
	</TileButton>;
}

export default function Tile({vault, onClick}: {vault: Vault, onClick: () => void}) {
	const {queryRe} = useFilter();
	const {blocksForVault, computeVaultDr} = useBlocks();

	const hasBlocks = useMemo(() => blocksForVault(vault).length > 0, [vault, blocksForVault]);
	const debtRatio = useMemo(() => computeVaultDr(vault), [vault, computeVaultDr]);
	const tvl = useMemo(() => {
		const series = getTvlSeries(vault);
		if(!series.length) return NaN;
		return series[series.length - 1];
	}, [vault]);

	const simulator = useSimulator();
	const apyProbeResults = useApyProbeResults(vault, simulator.probeStartResults, simulator.probeStopResults);
	const apyDelta = useApyProbeDelta(vault, apyProbeResults, false);

	return <div className={'flex flex-col gap-2'}>
		<TileButton onClick={onClick} selected={hasBlocks} className={'p-1 sm:p-3'}>
			<Row label={<div className={'grow pr-4 truncate font-bold text-lg'}>{highlightString(vault.name, queryRe)}</div>} className={'z-10'}>
				<div className={`
					flex items-center gap-2
					text-xs`}>
					<Chip className={`
						bg-neutral-200/40 dark:bg-neutral-800/40
						border border-neutral-200 dark:border-neutral-800
						`}>{vault.version}</Chip>
					<Chip className={`
						bg-${vault.network.name}-40
						border border-${vault.network.name}
						`}>{vault.network.name}</Chip>
				</div>
			</Row>
			<Row label={'TVL (USD)'} alt={true} heading={true}>
				<div className={'flex items-center gap-4'}>
					<Minibars vault={vault} />
					<Field value={formatNumber(tvl, 2, 'No TVL', true)} />
				</div>
			</Row>
			<Row label={'APY'}>
				{!(apyProbeResults.stop && apyDelta) && <Percentage value={vault.apy.net} />}
				{apyProbeResults.stop && apyDelta && <div className={'flex items-center gap-2'}>
					<Percentage simulated={true} value={apyProbeResults.stop.apy.net} />
					<Bps value={apyDelta.net} />
				</div>}
			</Row>
			<Row label={'Allocated'} alt={true}>
				<Percentage simulated={debtRatio.touched} bps={true} decimals={2} value={debtRatio.value} />
			</Row>
			<Row label={'Free assets'}>
				<Tokens decimals={vault.token.decimals || 18} value={vault.totalAssets?.sub(vault.totalDebt || BigNumber.from(0)) || BigNumber.from(0)} />
			</Row>
			<Row label={'Strategies in queue'} alt={true}>
				<Field value={vault.withdrawalQueue.length} />
			</Row>
		</TileButton>
		<div className={'flex items-center gap-2'}>
			<FavoriteButton vault={vault} selected={hasBlocks} className={'w-1/4 h-10 py-3 flex items-center justify-center'} />
			<TileButton selected={hasBlocks} onClick={() => window.open(getAddressExplorer(vault.network.chainId, vault.address), '_blank', 'noreferrer')} 
				className={'w-1/2 h-10 py-3 flex items-center justify-center font-mono text-sm'}>
				{truncateAddress(vault.address)}
			</TileButton>
			<CopyButton clip={vault.address} selected={hasBlocks} className={'w-1/4 h-10 py-3 flex items-center justify-center'} />
		</div>
	</div>;
}
