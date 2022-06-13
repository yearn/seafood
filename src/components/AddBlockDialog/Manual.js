import React, {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {useDebouncedCallback} from 'use-debounce';
import {BsAsterisk, BsCheckLg} from 'react-icons/bs';
import {useApp} from '../../context/useApp';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {GetBasicStrat, GetBasicVault} from '../../ethereum/EthHelpers';
import {useAddBlockDialog, stepEnum} from './useAddBlockDialog';

export default function Manual() {
	const {vaults, strats, favoriteVaults, favoriteStrategies} = useApp();
	const {selectedProvider} = useSelectedProvider();
	const {setSteps, setResult} = useAddBlockDialog();
	const [address, setAddress] = useState({value: null, valid: false, type: ''});
	const [favorites, setFavorites] = useState([]);
	const [block, setBlock] = useState();

	function locateStrategy(address) {
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
	}

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

		favoriteStrategies.forEach(favoriteStrategy => {
			const {vault, strategy} = locateStrategy(favoriteStrategy);
			if(vault) {
				refresh.push({
					address: strategy.address,
					name: `${vault.name} \\ ${strategy.name}`
				});
			}
		});

		setFavorites(refresh);
	}, [vaults, strats, favoriteVaults, favoriteStrategies]);

	const debounceAddress = useDebouncedCallback(async (value) => {
		value = value.trim();
		let newBlock = null;
		let valid = false;
		let type = null;

		if(ethers.utils.isAddress(value)) {
			try {
				newBlock = await GetBasicVault(value, selectedProvider);

				// HACK: Looking for a way to infer the contract type 
				// instead of having users select Vault or Strategy.
				// My assumption here is that strategies never have a governance() function.
				// So if this call fails we go on to check if the address is a strategy.
				await newBlock.contract.callStatic.governance();

				valid = true;
				type = 'vault';
			} catch (error) {
				try {
					newBlock = await GetBasicStrat(value, selectedProvider);
					valid = true;
					type = 'strategy';
				} catch (error) {
					valid = false; //lint sayonara
				}
			}
		}

		setAddress({value, valid, type});
		if(valid) setBlock(newBlock);
		else setBlock(null);
	}, 250);

	async function onSelectFunction() {
		switch(address.type) {
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
					<input type={'text'} defaultValue={address.value} onChange={(e) => {debounceAddress(e.target.value);}} placeholder={'address'} />
					<div className={'validation'}>
						{address.valid && <BsCheckLg className={'valid'}></BsCheckLg>}
						{!address.valid && <BsAsterisk className={'invalid'}></BsAsterisk>}
					</div>
				</div>
				{favorites.length && 
				<div className={'input'}>
					<select defaultValue={address.value} onChange={onSelectFavorite} className={'w-full'}>
						<option value={''}>{'Or choose a favorite'}</option>
						{favorites.map(favorite => 
							<option key={favorite.address} value={favorite.address}>{favorite.name}</option>
						)}
					</select>
				</div>}
				<div className={'mt-4 text-lg'}>
					&nbsp;{block?.name}&nbsp;
				</div>
				<button onClick={onSelectFunction} className={address.valid ? 'visible' : 'invisible'}>
					{`Select ${address.type} function`}
				</button>
			</div>
		</div>
	</div>;
}