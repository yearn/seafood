import React from 'react';
import toast from 'react-hot-toast';
import {BsBoxArrowInUpRight, BsStar, BsStarFill} from 'react-icons/bs';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {useApp} from '../../context/useApp';
import {GetExplorerLink, highlightString, TruncateAddress} from '../../utils/utils';

export default function StrategyTile({strategy, queryRe, onClick}) {
	const {selectedProvider} = useSelectedProvider();
	const {favorites} = useApp();

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
			<div onClick={() => {
				toast(`${strategy.address} copied to your clipboard`);
				navigator.clipboard.writeText(strategy.address);
			}}
			className={'center'}
			title={`Copy ${strategy.address} to your clipboard`}>
				{TruncateAddress(strategy.address)}
			</div>
			<a title={`Explore ${strategy.address}`}
				href={GetExplorerLink(selectedProvider.network.chainId, strategy.address)}
				target={'_blank'} rel={'noreferrer'}
				className={'plain right'}>
				&nbsp;<BsBoxArrowInUpRight />&nbsp;
			</a>
		</div>
	</div>;
}