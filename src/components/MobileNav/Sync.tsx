import React, {useCallback, useMemo} from 'react';
import {useVaults} from '../../context/useVaults';
import {TiWarning} from 'react-icons/ti';
import {useNavigate} from 'react-router';
import TimeAgo from '../controls/TimeAgo';

export function useVaultStatusUI() {
	const {refreshing, cachetime, status} = useVaults();

	const hasWarnings = useMemo(() => {
		return status.some(s => s.status === 'warning');
	}, [status]);

	const colors = useMemo(() => {
		return {
			text: refreshing 
				? 'text-selected-500' 
				: hasWarnings ? 'text-attention-600 dark:text-attention-400' : 'text-primary-600 dark:text-primary-400',
			bg: refreshing 
				? 'bg-selected-500' 
				: hasWarnings ? 'bg-attention-600 dark:bg-attention-400' : 'bg-primary-600 dark:bg-primary-400',
			hover: refreshing 
				? ''
				: hasWarnings ? 'hover:bg-attention-400/20 hover:dark:bg-attention-400/20' : 'hover:bg-primary-200 hover:dark:bg-primary-400/20'
		};
	}, [refreshing, hasWarnings]);

	const message = useMemo(() => {
		if(refreshing) return 'Syncing';
		if(cachetime.getTime() > 0) {
			if(!hasWarnings) return <div>{'Synced '}<TimeAgo date={cachetime} /></div>;
			if(hasWarnings) return 'Synced with warnings';
		}
		return '';
	}, [refreshing, cachetime, hasWarnings]);

	return {message, colors, hasWarnings};
}

export default function Sync() {
	const navigate = useNavigate();
	const {refreshing, refresh} = useVaults();
	const {message, colors, hasWarnings} = useVaultStatusUI();

	const cursor = useMemo(() => {
		return refreshing ? 'cursor-default' : 'cursor-pointer';
	}, [refreshing]);

	const onClick = useCallback(() => {
		if(refreshing) return;
		refresh();
	}, [refreshing, refresh]);

	return <div className={'flex items-center gap-1'}>
		<div onClick={() => navigate('/status')} title={refreshing ? '' : 'Start sync'} className={`
			px-3 py-2 text-xs
			${colors.text} ${colors.hover} ${cursor}`}>
			{message}
		</div>

		<div 
			onClick={onClick}
			title={refreshing ? '' : 'Status'}
			className={`
			p-2 relative flex items-center justify-center
			${refreshing ? '' : colors.hover} ${cursor}`}>
			{refreshing && <>
				{refreshing && <div className={`
					absolute h-3 w-3
					opacity-75 animate-ping
					${colors.bg}`} />}
				<div className={`
					h-2 w-2 m-1
					${colors.bg}`} />
			</>}

			{!refreshing && <div>
				{!hasWarnings && <div className={`
					h-2 w-2 m-1
					${colors.bg}`} />}
				{hasWarnings && <TiWarning className={`${colors.text} -m-[2px]`} />}
			</div>}
		</div>
	</div>;
}