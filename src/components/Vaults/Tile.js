import React, {useState} from 'react';
import {BsStar, BsStarFill} from 'react-icons/bs';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {useApp} from '../../context/useApp';
import {GetExplorerLink, highlightString, TruncateAddress} from '../../utils/utils';
import Bone from '../Bone';
import Sparkline from './Sparkline';

export default function Tile({vault, queryRe, onClick}) {
	const {favorites, strats} = useApp();
	const [copied, setCopied] = useState(false);
	const v_d = strats.find(element => element.address === vault.address);

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
			try {
				navigator.clipboard.writeText(vault.address);
			} finally {
				setCopied(true);
				setTimeout(() => {
					setCopied(false);
				}, 2500);
			}
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
						{!v_d && <div>
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
				<div className={'chart dark:group-hover:text-secondary-200'}>
					{v_d && <Sparkline />}
					{v_d && <div className={'tvl'}>{'TVL 10M'}</div>}
				</div>
			</div>
		</div>
		<div className={'footer dark:group-hover:text-secondary-200'}>
			<div className={'left'} onClick={toggleFavorite(vault)}>
				{!favorites.vaults.includes(vault.address) && <>&nbsp;<BsStar />&nbsp;</>}
				{favorites.vaults.includes(vault.address) && <>&nbsp;<BsStarFill className={'favorite glow-attention-md'} />&nbsp;</>}
			</div>
			<a className={'plain center'}
				title={`Explore ${vault.address}`}
				href={GetExplorerLink(vault.provider.network.chainId, vault.address)}
				target={'_blank'} rel={'noreferrer'}>
				{TruncateAddress(vault.address)}
			</a>
			<div className={'right'}
				title={`Copy ${vault.address} to your clipboard`}
				onClick={copyAddress(vault)}>
				{!copied && <TbCopy className={'text-lg'}></TbCopy>}
				{copied && <TbCheck className={'text-lg'}></TbCheck>}
			</div>
		</div>
	</div>;
}