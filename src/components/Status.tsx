import React, {useEffect, useMemo} from 'react';
import {useVaults} from '../context/useVaults';
import {SyncStatus} from '../context/useVaults/worker';
import {getChain} from '../utils/utils';
import TimeAgo from './controls/TimeAgo';
import {useVaultStatusUI} from './MobileNav/Sync';
import {usePowertools} from './Powertools';

function StatusLight() {
	const {loading, refresh} = useVaults();
	const {colors} = useVaultStatusUI();

	if(loading) {
		return <div className={`
			flex items-center justify-center`}>
			<div className={`
				absolute h-24 w-24
				opacity-75 animate-ping
				${colors.bg}`} />
			<div className={`
				h-20 w-20
				${colors.bg}`} />
		</div>;
	}

	return <div onClick={refresh} className={'flex items-center justify-center cursor-pointer'}>
		<div className={`h-20 w-20 ${colors.bg}`}></div>
	</div>;
}

function ListItem({status, className} : {status: SyncStatus, className: string}) {
	const chain = useMemo(() => {
		if(status.chain === 'all') return 'all chains';
		return getChain(status.chain).name;
	}, [status]);

	const colors = useMemo(() => ({
		text: status.status === 'ok' ? 'text-primary-600 dark:text-primary-400' : 'text-attention-600 dark:text-attention-400',
		bg: status.status === 'ok' ? 'bg-primary-400/20' : 'bg-attention-400/20'
	}), [status]);

	return <li className={`w-full pl-2 py-1 flex flex-grid grid-cols-3 justify-between gap-4 ${className}`}>
		<div className={`w-32 ${colors.text}`}>{chain}</div>
		<div className={`w-48 ${colors.text}`}><TimeAgo date={status.timestamp} /></div>
		<div 
			title={status.status === 'ok' ? '' : (status.error as object).toString()} 
			onClick={() => {if(status.error) console.log(status.error);}}
			className={`
			w-24 flex items-center justify-center
			${colors.bg} ${colors.text}`}>
			{status.status}
		</div>
	</li>;
}

function Stage({title, status}: {title: string, status: SyncStatus[]}) {
	return <div>
		<h2 className={'text-2xl'}>{title}</h2>
		<ul className={'w-full flex flex-col gap-2'}>
			{status.map((s, index) => <ListItem key={s.chain} status={s} className={index % 2 === 0 ? '' : 'bg-selected-400/5'} />)}
		</ul>
	</div>;
}

export default function Status() {
	const {status} = useVaults();
	const {message} = useVaultStatusUI();
	const ydaemon = useMemo(() => status.filter(s => s.stage === 'ydaemon'), [status]);
	const multicall = useMemo(() => status.filter(s => s.stage === 'multicall'), [status]);
	const rewards = useMemo(() => status.filter(s => s.stage === 'rewards'), [status]);
	const tvls = useMemo(() => status.filter(s => s.stage === 'tvls'), [status]);
	const {setEnable} = usePowertools();

	useEffect(() => {
		setEnable(false);
		return () => setEnable(true);
	}, [setEnable]);

	return <div className={'w-full pt-6 sm:pt-0 pb-16 flex items-center justify-center'}>
		<div className={'w-full sm:w-1/2 px-4 flex flex-col gap-8'}>
			<div className={'w-full h-32 flex items-center justify-center'}>
				<div className={'w-auto sm:w-1/2 pl-4 pr-6 sm:px-0 sm:pr-16 flex items-center justify-end'}>
					<StatusLight />
				</div>
				<div className={'grow sm:w-1/2'}>
					<div className={'font-bold'}>{'Seafood Data Sync'}</div>
					<div className={'text-2xl'}>{message}</div>
				</div>
			</div>
			<Stage title={'yDaemon'} status={ydaemon} />
			<Stage title={'Multicalls'} status={multicall} />
			<Stage title={'Rewards'} status={rewards} />
			<Stage title={'TVLs'} status={tvls} />
		</div>
	</div>;
}
