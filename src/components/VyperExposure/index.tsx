import React, {useEffect, useMemo, useState} from 'react';
import {usePowertools} from '../Powertools';
import {useVaults} from '../../context/useVaults';
import apiToVyperVersionMap from './api-to-vyper-version-map.json';
import {Number} from '../controls/Fields';
import {useNavigate} from 'react-router-dom';
import {Vault, defaultVault} from '../../context/useVaults/types';
import useLocalStorage from 'use-local-storage';

interface Exposure {
	vyperVersion: string, 
	vaults: Vault[],
	tvl: number
}

interface Program {
	address: string;
	name: string;
	tvl: number;
}

function useProgramVaults() {
	const [programs, setPrograms] = useLocalStorage<Program[]>(
		'src/components/vyperexposure/programs', []
	);

	useEffect(() => {
		(async () => {
			const response = await fetch('/api/programs');
			setPrograms(await response.json());
		})();
	}, [setPrograms]);
	return programs;
}

export function useExposureByVyperVersion() {
	const {vaults} = useVaults();
	const programs = useProgramVaults();
	const vyperVersionToApiVersionMap = useMemo(() => {
		return Object.entries(apiToVyperVersionMap).map(([apiVersion, vyperVersion]) => ({
			vyperVersion,
			apiVersion
		})) as {vyperVersion: string, apiVersion: string}[];
	}, []);

	const [results, setResults] = useState<Exposure[]>([]);

	useEffect(() => {
		const _results = [] as Exposure[];

		for(const vyperVersion of vyperVersionToApiVersionMap) {
			const vaultsOfThisVersion = vaults.filter(v => v.version === vyperVersion.apiVersion);
			const tvl = vaultsOfThisVersion.reduce((acc, v) => acc + (v.tvls?.tvls.slice(-1)[0] || 0), 0);
			const result = _results.find(e => e.vyperVersion === vyperVersion.vyperVersion);
			if(result) {
				result.vaults.push(...vaultsOfThisVersion);
				result.tvl += tvl;
			} else {
				_results.push({
					vyperVersion: vyperVersion.vyperVersion,
					vaults: vaultsOfThisVersion,
					tvl
				});
			}
		}

		if(programs.length > 0) {
			const asVaults = programs.map(p => ({
				...defaultVault, 
				network: {chainId: 1, name: 'Ethereum'},
				version: 'program',
				address: p.address,
				name: p.name,
				tvls: {tvls: [p.tvl, p.tvl, p.tvl], dates: []}
			}));
			_results.push({
				vyperVersion: '0.3.7',
				vaults: asVaults,
				tvl: programs.reduce((acc, p) => acc + p.tvl, 0)
			});
		}

		for(const result of _results) {
			result.vaults.sort((a, b) => {
				const aTvl = a.tvls ? a.tvls.tvls.slice(-1)[0] : 0;
				const bTvl = b.tvls ? b.tvls.tvls.slice(-1)[0] : 0;
				return bTvl - aTvl;
			});
		}

		_results.sort((a, b) => {
			return b.tvl - a.tvl;
		});

		setResults(_results);
	}, [vaults, vyperVersionToApiVersionMap, programs, setResults]);

	return results;
}

export default function VyperExposure() {
	const navigate = useNavigate();
	const {setEnable} = usePowertools();

	useEffect(() => {
		setEnable(false);
		return () => setEnable(true);
	}, [setEnable]);

	const exposureByVyperVersion = useExposureByVyperVersion();

	return <div className={'w-full pt-6 sm:pt-0 pb-24 flex items-center justify-center'}>
		<div className={'w-full sm:w-1/2 px-2 sm:px-4 flex flex-col gap-6'}>
			<div className={'mb-12 text-4xl text-center sm:text-left'}>
				{'Vyper Exposure'}
			</div>

			<div className={'px-2 grid grid-cols-3 gap-y-4 text-xl'}>
				<div>{'Vyper'}</div>
				<div className={'pr-8 text-right'}>{'Vaults'}</div>
				<div className={'text-right'}>{'TVL (USD)'}</div>
			</div>

			{exposureByVyperVersion.map((e, index) => <div 
				key={e.vyperVersion}
				onClick={() => navigate(`/vyper-exposure/${e.vyperVersion}`)}
				className={`
				px-2 py-2 grid grid-cols-3 gap-y-4 text-xl
				${index % 2 === 0 ? 'bg-selected-400/5' : ''}
				sm:hover:bg-selected-400 sm:active:bg-selected-500
				sm:dark:hover:bg-selected-600 sm:dark:active:bg-selected-700
				sm:dark:hover:text-black
				cursor-pointer`}>
				<div className={'text-xl'}>{e.vyperVersion}</div>
				<Number value={e.vaults.length} decimals={0} className={'pr-8'} />
				<Number value={e.tvl} decimals={2} nonFinite={'No TVL'} compact={true} />
			</div>)}

		</div>
	</div>;
}