import React, {useEffect, useMemo} from 'react';
import {motion} from 'framer-motion';
import {useVaults} from '../context/useVaults';
import {getChain} from '../utils/utils';
import TimeAgo from './controls/TimeAgo';
import {useVaultStatusUI} from './MobileNav/Sync';
import {usePowertools} from './Powertools';
import {RefreshStatus} from '../context/useVaults/worker/types';

function StatusLight({size, bloom}: {size: number, bloom: number}) {
	const {refreshing, refresh} = useVaults();
	const {colors} = useVaultStatusUI();

	if(refreshing) {
		return <div className={`
			flex items-center justify-center`}>
			<div className={`
				absolute h-${bloom} w-${bloom}
				opacity-75 animate-ping
				${colors.bg}`} />
			<div className={`h-${size} w-${size} ${colors.bg}`} />
		</div>;
	}

	return <div onClick={refresh} className={'flex items-center justify-center cursor-pointer'}>
		<div className={`h-${size} w-${size} ${colors.bg}`}></div>
	</div>;
}

function ListItem({status, className} : {status: RefreshStatus, className: string}) {
	const chain = useMemo(() => {
		if(status.chain === 'all') return 'all chains';
		return getChain(status.chain).name;
	}, [status]);

	const colors = useMemo(() => {
		switch(status.status) {
		case 'refreshing': return {
			text: 'text-selected-600 dark:text-selected-400',
			bg: 'bg-selected-400/20'
		};
		case 'warning': return {
			text: 'text-attention-600 dark:text-attention-400',
			bg: 'bg-attention-400/20'
		};
		default: return {
			text: 'text-primary-600 dark:text-primary-400',
			bg: 'bg-primary-400/20'
		};}
	}, [status]);

	return <li className={`w-full pl-2 py-1 flex flex-grid grid-cols-3 justify-between gap-4 ${className}`}>
		<div className={`w-32 ${colors.text}`}>{chain}</div>
		<div className={`w-48 ${colors.text}`}>
			{status.status === 'refreshing' ? <>{'~~~~~~~~'}</> : <TimeAgo date={status.timestamp} />}
		</div>
		<div 
			title={status.status === 'warning' ? (status.error as object).toString() : ''} 
			onClick={() => {if(status.error) console.log(status.error);}}
			className={`
			w-24 flex items-center justify-center
			${colors.bg} ${colors.text}`}>
			{status.status === 'refreshing' ? 'syncing' : status.status}
		</div>
	</li>;
}

function Stage({title, status}: {title: string, status: RefreshStatus[]}) {
	return <div>
		<h2 className={'text-2xl'}>{title}</h2>
		<ul className={'w-full flex flex-col gap-2'}>
			{status.map((s, index) => 
				<motion.div key={`${s.stage}-${s.chain}-${s.status}}`}
					transition={{type: 'spring', stiffness: 2200, damping: 32}}
					initial={{y: -4, opacity: 0}}
					animate={{y: 0, opacity: 1}}>
					<ListItem key={s.chain} status={s} className={index % 2 === 0 ? '' : 'bg-selected-400/5'} />
				</motion.div>
			)}
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

	return <div className={'w-full pt-6 sm:pt-0 pb-24 flex items-center justify-center'}>
		<div className={'w-full sm:w-1/2 px-4 flex flex-col gap-8'}>
			<div className={'w-full h-32 flex items-center justify-center'}>
				<div className={'w-auto sm:w-1/2 pl-4 pr-6 sm:px-0 sm:pr-16 flex items-center justify-end'}>
					<StatusLight size={20} bloom={24} />
				</div>
				<div className={'grow sm:w-1/2'}>
					<div className={'font-bold'}>{'Seafood Data Sync'}</div>
					<div className={'text-2xl'}>{message}</div>
				</div>
			</div>
			<Stage title={'yDaemon'} status={ydaemon} />
			<Stage title={'TVLs'} status={tvls} />
			<Stage title={'Multicalls'} status={multicall} />
			<Stage title={'Rewards'} status={rewards} />
		</div>
	</div>;
}
