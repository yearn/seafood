import React, {useCallback, useMemo} from 'react';
import {useVaults} from '../../context/useVaults';
import {TiWarning} from 'react-icons/ti';
import {useNavigate} from 'react-router';
import TimeAgo from '../controls/TimeAgo';

export function useVaultStatusUI() {
	const {loading, cachetime, status} = useVaults();

	const hasWarnings = useMemo(() => {
		return status.some(s => s.status === 'warning');
	}, [status]);

	const colors = useMemo(() => {
		return {
			text: loading 
				? 'text-selected-500' 
				: hasWarnings ? 'text-attention-600 dark:text-attention-400' : 'text-primary-600 dark:text-primary-400',
			bg: loading 
				? 'bg-selected-500' 
				: hasWarnings ? 'bg-attention-600 dark:bg-attention-400' : 'bg-primary-600 dark:bg-primary-400',
			hover: loading 
				? ''
				: hasWarnings ? 'hover:bg-attention-400/20 hover:dark:bg-attention-400/20' : 'hover:bg-primary-200 hover:dark:bg-primary-400/20'
		};
	}, [loading, hasWarnings]);

	const message = useMemo(() => {
		if(loading) return 'Syncing';
		if(cachetime.getTime() > 0) {
			if(!hasWarnings) return <div>{'Synced '}<TimeAgo date={cachetime} /></div>;
			if(hasWarnings) return 'Synced with warnings';
		}
		return '';
	}, [loading, cachetime, hasWarnings]);

	return {message, colors, hasWarnings};
}

export default function Sync() {
	const navigate = useNavigate();
	const {loading, refresh} = useVaults();
	const {message, colors, hasWarnings} = useVaultStatusUI();

	const cursor = useMemo(() => {
		return loading ? 'cursor-default' : 'cursor-pointer';
	}, [loading]);

	const onClick = useCallback(() => {
		if(loading) return;
		refresh();
	}, [loading, refresh]);

	return <div className={'flex items-center gap-1'}>
		<div onClick={() => navigate('/status')} title={loading ? '' : 'Start sync'} className={`
			px-3 py-2 text-xs
			${colors.text} ${colors.hover} ${cursor}`}>
			{message}
		</div>

		<div 
			onClick={onClick}
			title={loading ? '' : 'Status'}
			className={`
			p-2 relative flex items-center justify-center
			${loading ? '' : colors.hover} ${cursor}`}>
			{loading && <>
				{loading && <div className={`
					absolute h-3 w-3
					opacity-75 animate-ping
					${colors.bg}`} />}
				<div className={`
					h-2 w-2 m-1
					${colors.bg}`} />
			</>}

			{!loading && <div>
				{!hasWarnings && <div className={`
					h-2 w-2 m-1
					${colors.bg}`} />}
				{hasWarnings && <TiWarning className={`${colors.text} -m-[2px]`} />}
			</div>}
		</div>
	</div>;
}