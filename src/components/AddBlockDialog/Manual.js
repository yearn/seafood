import React, {useState, useEffect, useCallback} from 'react';
import {ethers} from 'ethers';
import {useDebouncedCallback} from 'use-debounce';
import {BsAsterisk, BsCheckLg} from 'react-icons/bs';
import {useApp} from '../../context/useApp';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {GetBasicStrat, GetBasicVault} from '../../ethereum/EthHelpers';
import {useAddBlockDialog, stepEnum} from './useAddBlockDialog';
import useLocalStorage from 'use-local-storage';

export default function Manual() {
	const {vaults, strats, favorites} = useApp();
	const {selectedProvider} = useSelectedProvider();
	const {setSteps, setResult} = useAddBlockDialog();
	const [address, setAddress] = useLocalStorage('addBlock.manual.address', '');
	const [type, setType] = useState('');
	const [valid, setValid] = useState(false);
	const [defaultValue, setDefaultValue] = useState({address: ''});

	const [favoritesList, setFavorites] = useState([]);
	const [block, setBlock] = useState();

	const locateStrategy = useCallback((address) => {
		for(let v = 0; v < strats.length; v++) {
			const strategy = strats[v].strats_detailed?.find(s => s.address === address);
			if(strategy) {
				return {
					vault: strats[v],
					strategy
				};
			}
		}
		return {
			vault: undefined,
			strategy: undefined
		};
	}, [strats]);

	useEffect(() => {
		const refresh = [
			...vaults.filter(vault => favorites.vaults.includes(vault.address) 
			&& vault.provider.network.chainId === selectedProvider?.network.chainId).map(vault => {
				return {
					address: vault.address,
					name: `${vault.name} (${vault.version})`
				};
			})
		];

		favorites.strategies.forEach(favoriteStrategy => {
			const {vault, strategy} = locateStrategy(favoriteStrategy);
			if(vault) {
				refresh.push({
					address: strategy.address,
					name: `${vault.name} (${vault.version}) \\ ${strategy.name}`
				});
			}
		});

		setFavorites(refresh);
	}, [vaults, strats, favorites, selectedProvider, locateStrategy]);

	const debounceAddress = useDebouncedCallback(async (value) => {
		value = value.trim();
		setAddress(value);
	}, 250);

	useEffect(() => {
		(async () => {
			if(ethers.utils.isAddress(address)) {
				try {
					const block = await GetBasicVault(address, selectedProvider);
	
					// HACK: Looking for a way to infer the contract type 
					// instead of having users select Vault or Strategy.
					// My assumption here is that strategies never have a governance() function.
					// So if this call fails we go on to check if the address is a strategy.
					await block.contract.callStatic.governance();
	
					setBlock(block);
					setType('vault');
					setValid(true);
				} catch (error) {
					try {
						const block = await GetBasicStrat(address, selectedProvider);
						setBlock(block);
						setType('strategy');
						setValid(true);
					} catch (error) {
						error;
					}
				}
			} else {
				setBlock(null);
				setType('');
				setValid(false);
			}
			setDefaultValue({address});
		})();
	}, [selectedProvider, address]);

	async function onSelectFunction() {
		switch(type) {
		case 'vault': {
			setResult(result => {return {
				...result, 
				vault: block,
				strategy: null
			};});
			setSteps(steps => {return [
				...steps, 
				stepEnum.selectVaultFunctionOrStrategy
			];});
			break;
		}
		case 'strategy': {
			const {vault} = locateStrategy(block.address);
			setResult(result => {return {
				...result, 
				vault,
				strategy: block
			};});
			setSteps(steps => {return [
				...steps, 
				stepEnum.selectStrategyFunction
			];});
			break;
		}}
	}

	async function onSelectFavorite(e) {
		debounceAddress(e.target.value);
	}

	return <div className={'h-full flex flex-col'}>
		<div className={'inputs'}>
			<div className={'scroll-container'}>
				<p className={'pl-8 pr-12 py-4 text-3xl'}>{'Enter a vault or strategy address'}</p>
				<div className={'input flex items-center'}>
					<input type={'text'} defaultValue={defaultValue.address} onChange={(e) => {debounceAddress(e.target.value);}} placeholder={'address'} />
					<div className={'validation'}>
						{valid && <BsCheckLg className={'valid'}></BsCheckLg>}
						{!valid && <BsAsterisk className={'invalid'}></BsAsterisk>}
					</div>
				</div>
				<div className={'input'}>
					<select value={defaultValue.address} onChange={onSelectFavorite} className={'w-full'}>
						<option value={''}>{'Or choose a favorite'}</option>
						{favoritesList.map(favorite => 
							<option key={favorite.address} value={favorite.address}>{favorite.name}</option>
						)}
					</select>
				</div>
				<div className={'mt-4 text-lg'}>
					&nbsp;{block?.name}&nbsp;
				</div>
				<button onClick={onSelectFunction} className={valid ? '' : 'invisible'}>
					{`Select ${type} function`}
				</button>
			</div>
		</div>
	</div>;
}