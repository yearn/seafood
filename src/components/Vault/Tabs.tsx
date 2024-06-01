import React, {useMemo} from 'react';
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

	const tabs = useMemo(() => {
		if(!vault) return [];
		if(!vault.yearn) return [
			{label: 'Assets', content: AssetsTab},
			{label: 'APY', content: ApyTab},
		];
		if(!mediumBreakpoint && vault.type === 'vault') {
			return [
				{label: 'Assets', content: AssetsTab},
				{label: 'APY', content: ApyTab},
				{label: 'Strategies', content: StrategiesTab},
				{label: 'Info', content: InfoTab}
			];
		} else {
			return [
				{label: 'Assets', content: AssetsTab},
				{label: 'APY', content: ApyTab},
				{label: 'Info', content: InfoTab}
			];
		}
	}, [vault, mediumBreakpoint]);

	if(!vault) return <></>;

	if(mediumBreakpoint) return <div className={`
		self-start flex flex-col gap-8
		${className}`}>
		<Tabbed
			className={'flex items-start gap-3'}
			tabClassName={`px-6 py-2
				border-b-4 
				border-secondary-200 hover:border-selected-400 active:border-selected-600
				dark:border-secondary-800 hover:dark:border-selected-500 active:dark:border-selected-700`}
			activeTabClassName={`px-6 py-2
				border-b-4 border-primary-400`}
			contentClassName={'py-6'}
			storageKey={'src/vault/tabs'}
			tabs={tabs} />
	</div>;

	return <div className={`
		self-start px-4 flex flex-col gap-4
		${className}`}>
		<Tabbed
			className={'flex items-start gap-3'}
			tabClassName={`px-6 py-2
				border-b-4 
				border-secondary-200 hover:border-selected-400 active:border-selected-600
				dark:border-secondary-800 hover:dark:border-selected-500 active:dark:border-selected-700`}
			activeTabClassName={`px-6 py-2
				border-b-4 border-primary-400`}
			contentClassName={'py-6'}
			storageKey={'src/vault/tabs'}
			tabs={tabs} />
	</div>;
}
