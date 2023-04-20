import React from 'react';
import {useVault} from './VaultProvider';
import Tabbed from '../controls/Tabbed';
import StrategiesTab from './StrategiesTab';
import AssetsTab from './AssetsTab';
import ApyTab from './ApyTab';
import {useMediumBreakpoint} from '../../utils/breakpoints';
import InfoTab from './InfoTab';

export default function Tabs({className}: {className?: string}) {
	const mediumBreakpoint = useMediumBreakpoint();
	const {vault} = useVault();
	if(!vault) return <></>;

	if(mediumBreakpoint) return <div className={`
		self-start flex flex-col gap-8
		${className}`}>
		<Tabbed
			className={'flex items-start gap-3'}
			tabClassName={'px-6 py-2 border border-transparent bg-secondary-200 dark:bg-primary-950'}
			activeTabClassName={'px-6 py-2 border-t border-x border-primary-400'}
			contentClassName={'py-6'}
			storageKey={'src/vault/tabs'}
			tabs={[
				{label: 'Assets', content: AssetsTab({vault})},
				{label: 'APY', content: ApyTab({vault})},
				{label: 'Info', content: InfoTab({vault})}
			]} />
	</div>;

	return <div className={`
		self-start px-4 flex flex-col gap-4
		${className}`}>
		<Tabbed
			className={'flex items-start gap-3'}
			tabClassName={'px-6 py-2 border border-transparent bg-primary-950'}
			activeTabClassName={'px-6 py-2 border-t border-x border-primary-600'}
			contentClassName={'py-6'}
			storageKey={'src/vault/tabs'}
			tabs={[
				{label: 'Assets', content: AssetsTab({vault})},
				{label: 'APY', content: ApyTab({vault})},
				{label: 'Strategies', content: StrategiesTab({vault})},
				{label: 'Info', content: InfoTab({vault})}
			]} />
	</div>;
}
