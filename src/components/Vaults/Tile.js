import React from 'react';
import {BsBoxArrowInUpRight, BsStar, BsStarFill} from 'react-icons/bs';
import toast from 'react-hot-toast';
import {useApp} from '../../context/useApp';
import {GetExplorerLink, highlightString, TruncateAddress} from '../../utils/utils';
import Bone from '../Bone';

export default function Tile({vault, queryRe, onClick}) {
	const {favorites, strats} = useApp();

	// console.log(strats);
	const v_d = strats.find(element => element.address === vault.address);
	//console.log(v_d);
	function toggleFavorite(vault) {
		return () => {
			favorites.setVaults(vaults => {
				const index = vaults.indexOf(vault.address);
				if(index > -1) {
					vaults.splice(index, 1);
				} else {
					vaults.push(vault.address);
				}
				return [...vaults];
			});
		};
	}

	function copyAddress(vault) {
		return () => {
			toast(`${vault.address} copied to your clipboard`);
			navigator.clipboard.writeText(vault.address);
		};
	}

	return <div className={'group vault-tile'}>
		
		<div onClick={onClick} className={'main'}>
			<div className={'title'}>{highlightString(vault.name, queryRe)}</div>
			<div className={'body'}>
				<div className={'info'}>
					<div className={'chips'}>
						<div className={'chip version'}>{vault.version}</div>
						<div className={`chip ${vault.provider.network.name}`}>{vault.provider.network.name}</div>
					</div>
					<div className={'strategies dark:group-hover:text-secondary-200'}>
						{!v_d && <div className={'animate-pulse'}>
							<div><Bone></Bone></div>
							<div><Bone></Bone></div>
							<div><Bone></Bone></div>
						</div>}
						{v_d && <div>
							<div>{v_d.strats.length + ' Strategies'}</div>
							<div>{(v_d.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}{'% Allocated'}</div>
							<div>{((v_d.totalAssets - v_d.totalDebt) / (10 ** v_d.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}{' Free'}</div>
						</div>}
					</div>
				</div>
				<div className={'chart'}>
					<div>
						{v_d && <></>  /* <InfoChart name={'PPS'} /> */}
					</div>
				</div>
			</div>
		</div>
		<div className={'footer dark:group-hover:text-secondary-200'}>
			<div className={'left'} onClick={toggleFavorite(vault)}>
				{!favorites.vaults.includes(vault.address) && <>&nbsp;<BsStar />&nbsp;</>}
				{favorites.vaults.includes(vault.address) && <>&nbsp;<BsStarFill className={'favorite glow-attention-md'} />&nbsp;</>}
			</div>
			<div className={'center'}
				title={`Copy ${vault.address} to your clipboard`}
				onClick={copyAddress(vault)}>
				{TruncateAddress(vault.address)}
			</div>
			<a className={'plain right'}
				title={`Explore ${vault.address}`}
				href={GetExplorerLink(vault.provider.network.chainId, vault.address)}
				target={'_blank'} rel={'noreferrer'}>
				&nbsp;<BsBoxArrowInUpRight />&nbsp;
			</a>		
		</div>
	</div>;
}