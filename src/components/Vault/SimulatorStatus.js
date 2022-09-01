import React from 'react';
import {useSimulator} from './SimulatorProvider';
import {useVault} from './VaultProvider';

export default function SimulatorStatus() {
	const {vault} = useVault();
	const simulator = useSimulator();

	return <div className={'flex items-center justify-center gap-1 sm:gap-2'}>
		{vault.strats_detailed.map(strategy => {
			const results = simulator.strategyResults[strategy.address];
			if(simulator.simulatingStrategy[strategy.address]) {
				return <div key={strategy.address} className={`
					grow h-1 bg-secondary-300 dark:bg-secondary-600 rounded animate-pulse`} />;
			} else if(results) {
				if(results.status === 'ok') {
					return <div key={strategy.address} className={`
						grow h-1 bg-primary-400 dark:bg-primary-600 rounded`} />;
				} else if(results.status === 'error') {
					return <div key={strategy.address} className={`
						grow h-1 bg-error-400 rounded`} />;
				}
			} else {
				return <div key={strategy.address} className={`
					grow h-1 bg-secondary-200 dark:bg-secondary-400/10 rounded`} />;
			}
		})}
	</div>;
}