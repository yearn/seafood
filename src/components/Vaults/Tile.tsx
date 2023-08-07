import React, {ReactNode, useCallback, useMemo, useState} from 'react';
import {Vault} from '../../context/useVaults/types';
import {useFilter} from './Filter/useFilter';
import {Row} from '../controls';
import {Bps, Field, Number, Percentage, Tokens} from '../controls/Fields';
import {getAddressExplorer, highlightString, truncateAddress} from '../../utils/utils';
import {BsStar, BsStarFill} from 'react-icons/bs';
import {TbCheck, TbCopy} from 'react-icons/tb';
import {useFavorites} from '../../context/useFavorites';
import {useBlocks} from '../../context/useSimulator/BlocksProvider';
import {useSimulator} from '../../context/useSimulator';
import {useApyProbeDelta, useApyProbeResults} from '../../context/useSimulator/ProbesProvider/useApyProbe';
import {useAssetsProbeResults} from '../../context/useSimulator/ProbesProvider/useAssetsProbe';
import {getTvlSeries} from '../../utils/vaults';

function Chip({className, children}: {className: string, children: ReactNode}) {
	return <div className={`
		px-2 py-1 ${className}
		group-hover:border-selected-500 group-hover:bg-selected-500
		group-active:border-selected-600 group-active:bg-selected-600 group-active:text-black
		group-hover:text-black`}>
		{children}
	</div>;
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
	onClick: (event?: React.MouseEvent<HTMLDivElement>) => void,
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

export default function Tile({vault, onClick}: {vault: Vault, onClick: (event?: React.MouseEvent<HTMLDivElement>) => void}) {
	const {queryRe} = useFilter();
	const {blocksForVault, computeVaultDr} = useBlocks();
	const simulator = useSimulator();
	const vaultDebtRatio = computeVaultDr(vault);
	const apyProbeResults = useApyProbeResults(vault, simulator.probeStartResults, simulator.probeStopResults);
	const apyDelta = useApyProbeDelta(vault, apyProbeResults, false);
	const {tvl, deployed} = useAssetsProbeResults(vault, simulator.probeStartResults, simulator.probeStopResults);

	const hasBlocks = useMemo(() => blocksForVault(vault).length > 0, [vault, blocksForVault]);

	const apy = useMemo(() => {
		if(apyProbeResults.stop && apyDelta) {
			return {
				simulated: true,
				value: apyProbeResults.stop.apy.net,
				delta: apyDelta.net
			};
		} else {
			return {
				simulated: false,
				value: vault.apy.net,
				delta: 0
			};
		}
	}, [vault, apyProbeResults, apyDelta]);

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
			<Row label={<div className={'flex items-center gap-4'}>
				<div>{'TVL (USD)'}</div>
				<Minibars vault={vault} />
			</div>} alt={true} heading={true}>
				<div className={'flex items-center gap-2'}>
					{tvl.simulated && <Number
						value={tvl.delta}
						simulated={tvl.simulated}
						decimals={2}
						compact={true}
						sign={true}
						format={'(%s)'}
						animate={true}
						className={'text-xs'} />}
					<Number
						value={tvl.value}
						simulated={tvl.simulated}
						decimals={2}
						nonFinite={'No TVL'}
						compact={true} 
						animate={true} />
				</div>
			</Row>
			<Row label={'APY'}>
				<div className={'flex items-center gap-2'}>
					{apy.simulated && <Bps 
						simulated={true} 
						value={apy.delta}
						sign={true}
						format={'(%s)'}
						animate={true}
						className={'text-xs'} />}
					<Percentage simulated={apy.simulated} value={apy.value} animate={true} nonFinite={'na'} />
				</div>
			</Row>
			<Row label={'Allocated'} alt={true}>
				<div className={'flex items-center gap-2'}>
					{vaultDebtRatio.simulated && <Bps
						simulated={vaultDebtRatio.simulated}
						value={vaultDebtRatio.delta / 10_000}
						sign={true}
						format={'(%s)'}
						animate={true}
						className={'text-xs'} />}
					<Percentage
						simulated={vaultDebtRatio.simulated} 
						value={vaultDebtRatio.value / 10_000}
						animate={true} />
				</div>
			</Row>
			<Row label={'Deployed'}>
				<div className={'flex items-center gap-2'}>
					{deployed.simulated && <Percentage
						simulated={deployed.simulated}
						value={deployed.delta}
						sign={true}
						format={'(%s)'}
						className={'text-xs'}
						animate={true} />}
					<Percentage
						simulated={deployed.simulated}
						value={deployed.value}
						animate={true} />
				</div>
			</Row>
			<Row label={<div className={'w-1/3 whitespace-nowrap'}>{'Deposit limit'}</div>} alt={true}>
				{vault.warnings?.some(w => w.key === 'noDepositLimit') && <div className={'w-1/3 text-xxs text-center attention-text'}>
					{'deposit limit = 0'}
				</div>}
				<Tokens 
					value={vault.depositLimit} 
					decimals={vault.token.decimals || 18}
					nonFinite={'na'}
					className={'w-1/3'} />
			</Row>
			<Row label={<div className={'w-1/3'}>{'Strategies'}</div>}>
				{vault.warnings?.some(w => w.key === 'noHealthCheck') && <div className={'w-1/3 text-xxs text-center attention-text whitespace-nowrap'}>
					{'missing health check'}
				</div>}
				<Field value={vault.withdrawalQueue.length} className={'w-1/3'} />
			</Row>
			<Row label={'Rewards (USD)'} alt={true}>
				<div className={'flex items-center gap-2'}>
					<Number
						simulated={false}
						animate={true}
						value={vault.rewardsUsd || 0}
						compact={true}
						decimals={2} />
				</div>
			</Row>
		</TileButton>
		<div className={'flex items-center gap-2'}>
			<FavoriteButton vault={vault} selected={hasBlocks} className={'w-1/4 h-10 py-3 flex items-center justify-center'} />
			<TileButton selected={hasBlocks} onClick={() => window.open(getAddressExplorer(vault.network.chainId, vault.address), '_blank', 'noreferrer')} 
				className={'w-1/2 h-10 py-3 flex items-center justify-center text-sm'}>
				{truncateAddress(vault.address)}
			</TileButton>
			<CopyButton clip={vault.address} selected={hasBlocks} className={'w-1/4 h-10 py-3 flex items-center justify-center'} />
		</div>
	</div>;
}
