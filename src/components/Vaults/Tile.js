import React from 'react';
import {BsBoxArrowInUpRight, BsStar, BsStarFill} from 'react-icons/bs';
import toast from 'react-hot-toast';
import {useApp} from '../../context/useApp';
import {GetExplorerLink, TruncateAddress} from '../../utils/utils';
import {useFilter} from './useFilter';

export default function Tile({vault, onClick}) {
	const {favoriteVaults, setFavoriteVaults, strats} = useApp();
	const {queryRe} = useFilter();

	function styleTitle(title) {
		const match = title.match(queryRe);
		if (match) {
			const matchedText = match[0];
			const left = title.substring(0, match.index);
			const middle = title.substring(match.index, match.index + matchedText.length);
			const right = title.substring(match.index + matchedText.length);
			return <>
				{left}
				<span className={'rainbow-text'}>{middle}</span>
				{right}
			</>;
		}
		return title;
	}

	// console.log(strats);
	const v_d = strats.find(element => element.address === vault.address);
	//console.log(v_d);
	function toggleFavorite(vault) {
		return () => {
			setFavoriteVaults(favorites => {
				const index = favorites.indexOf(vault.address);
				if(index > -1) {
					favorites.splice(index, 1);
				} else {
					favorites.push(vault.address);
				}
				return [...favorites];
			});
		};
	}

	function copyAddress(vault) {
		return () => {
			toast(`${vault.address} copied to your clipboard`);
			navigator.clipboard.writeText(vault.address);
		};
	}

	return <div className={'vault-tile'}>
		
		<div onClick={onClick} className={'main'}>
			<div className={'title'}>{styleTitle(vault.name)}</div>
			<div className={'body'}>
				<div className={'info'}>
					<div className={'chips'}>
						<div className={'chip version'}>{vault.version}</div>
						<div className={`chip ${vault.provider.network.name}`}>{vault.provider.network.name}</div>
					</div>
					<div className={'strategies'}>
						{v_d && <div>
							<p>{v_d.strats.length + ' Strategies'}</p>
							<p>{(v_d.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}{'% Allocated'}</p> 
							<p>{((v_d.totalAssets - v_d.totalDebt) / (10 ** v_d.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}{' Free'}</p>
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
		<div className={'footer'}>
			<div className={'left'} onClick={toggleFavorite(vault)}>
				{!favoriteVaults.includes(vault.address) && <>&nbsp;<BsStar />&nbsp;</>}
				{favoriteVaults.includes(vault.address) && <>&nbsp;<BsStarFill className={'favorite glow-attention-md'} />&nbsp;</>}
			</div>
			<div className={'center'}
				title={`Copy ${vault.address} to your clipboard`}
				onClick={copyAddress(vault)}>
				{TruncateAddress(vault.address)}
			</div>
			<a className={'right'}
				title={`Explore ${vault.address}`}
				href={GetExplorerLink(vault.provider.network.chainId, vault.address)}
				target={'_blank'} rel={'noreferrer'}>
				&nbsp;<BsBoxArrowInUpRight />&nbsp;
			</a>		
		</div>
	</div>;
}