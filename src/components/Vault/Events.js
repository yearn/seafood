import React, {useCallback, useEffect, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {formatPercent, formatTokens, truncateAddress} from '../../utils/utils';
import {A} from '../controls';

export default function Events({vault, token, strategyResults}) {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if(strategyResults.length === 0) {
			navigate(location.pathname);
		}
	}, [strategyResults, location, navigate]);

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

	if(!(vault && strategy)) return <></>;

	return <div className={'w-full h-full flex items-start justify-center overflow-y-auto'}>
		<div className={`
			w-full sm:w-[65ch] px-4 sm:px-0 pt-12 pb-12 sm:pb-24 flex flex-col items-center justify-center gap-8`}>
			<div className={'w-full'}>
				<h1>{'Simulated Harvest Events'}</h1>
				<div className={'text-xl'}>{`${vault.name} / ${strategy.name}`}</div>
				<div>
					<A href={strategyResults[strategy.address]?.simulationUrl}
						target={'_blank'} 
						rel={'noreferrer'}>
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