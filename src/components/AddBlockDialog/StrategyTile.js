import React, {useState} from 'react';
import {BsStar, BsStarFill} from 'react-icons/bs';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {useApp} from '../../context/useApp';
import {GetExplorerLink, highlightString, TruncateAddress} from '../../utils/utils';

export default function StrategyTile({strategy, queryRe, onClick}) {
	const {selectedProvider} = useSelectedProvider();
	const {favorites} = useApp();
	const [copied, setCopied] = useState(false);

	function toggleFavorite() {
		return () => {
			favorites.setStrategies(strategies => {
				const index = strategies.indexOf(strategy.address);
				if(index > -1) {
					strategies.splice(index, 1);
				} else {
					strategies.push(strategy.address);
				}
				return [...strategies];
			});
		};
	}

	function copyAddress(strategy) {
		return () => {
			try {
				navigator.clipboard.writeText(strategy.address);
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
			<div className={'title'}>{highlightString(strategy.name, queryRe)}</div>
			<div className={'info'}>
				<div className={'chips'}>
					<div className={'chip bg-pink-400 dark:bg-pink-800'}>{'strategy'}</div>
				</div>
			</div>
		</div>
		<div className={'footer dark:group-hover:text-secondary-200'}>
			<div className={'left'} onClick={toggleFavorite()}>
				{!favorites.strategies.includes(strategy.address) && <>&nbsp;<BsStar />&nbsp;</>}
				{favorites.strategies.includes(strategy.address) && <>&nbsp;<BsStarFill className={'favorite glow-attention-md'} />&nbsp;</>}
			</div>
			<a title={`Explore ${strategy.address}`}
				href={GetExplorerLink(selectedProvider.network.chainId, strategy.address)}
				target={'_blank'} rel={'noreferrer'}
				className={'plain center'}>
				{TruncateAddress(strategy.address)}
			</a>
			<div onClick={copyAddress(strategy)} 
				title={`Copy ${strategy.address} to your clipboard`}
				className={'right'}>
				{!copied && <TbCopy className={'text-lg'}></TbCopy>}
				{copied && <TbCheck className={'text-lg'}></TbCheck>}
			</div>
		</div>
	</div>;
}