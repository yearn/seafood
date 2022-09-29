import React, {useCallback, useEffect, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {formatPercent, formatTokens, truncateAddress} from '../../utils/utils';
import {useChrome} from '../Chrome';
import {A} from '../controls';
import CloseDialog from '../controls/Dialog/Close';
import {useSimulator} from './SimulatorProvider';
import {useVault} from './VaultProvider';

export default function Events() {
	const location = useLocation();
	const navigate = useNavigate();
	const {setHeader} = useChrome();
	const {strategyResults} = useSimulator();
	const {vault, token} = useVault();

	useEffect(() => {
		window.scrollTo({top: 0});
	}, []);

	useEffect(() => {
		if(strategyResults.length === 0) {
			navigate(location.pathname);
		} else {
			setHeader(false);
		}
	}, [setHeader, strategyResults, location, navigate]);

	const strategy = useMemo(() => {
		const strategy = location.hash.replace('#harvest-events-', '');
		return vault.strategies.find(s => s.address === strategy);
	}, [location, vault]);

	const events = useMemo(() => {
		if(strategy && strategyResults[strategy.address]) {
			return strategyResults[strategy.address].output.events;
		} else {
			return [];
		}
	}, [strategy, strategyResults]);

	function keys(args) {
		return Object.keys(args).filter(k => isNaN(k));
	}

	const formatArg = useCallback((key, arg) => {
		const addressRe = /^(0x[a-fA-F0-9]{40})$/;
		const tokenAmountRe = /^\d{9,}$/;

		switch(key) {
		case 'debtRatio': {
			return formatPercent(arg / 10_000, 2);
		} default: {
			if(addressRe.test(arg)) {
				return truncateAddress(arg);
			} else if(tokenAmountRe.test(arg)) {
				return formatTokens(arg, token.decimals, 2, false);
			} else {
				return arg;
			}
		}}
	}, [token]);

	return <div className={'px-4 sm:px-32 pb-12 sm:pb-32 flex justify-center overflow-x-auto'}>
		<CloseDialog onClick={() => setHeader(true)} />
		<div className={`
			w-[65ch] flex flex-col items-center justify-center gap-8`}>
			<div className={'w-full'}>
				<h1>{'Harvest Events'}</h1>
				<div className={'text-xl'}>{`${vault.name} / ${strategy.name}`}</div>
				<div>
					<A
						target={'_blank'} 
						href={strategyResults[strategy.address]?.simulationUrl} rel={'noreferrer'}>
						{'Explore on Tenderly'}
					</A>
				</div>
			</div>
			{events?.map((event, index) => <div key={index} className={'w-full'}>
				<div className={'font-bold text-xl'}>{event.name}</div>
				{keys(event.args).map((key, index) => <div key={key} className={`
					px-4 py-2 w-full flex items-center justify-between rounded
					${index % 2 === 0 ? '' : 'bg-selected-400/5'}`}>
					<div>{key}</div>
					<div className={'font-mono'}>{formatArg(key, event.args[key]).toString()}</div>
				</div>)}
			</div>)}
		</div>
	</div>;
}