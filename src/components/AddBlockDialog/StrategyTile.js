import React from 'react';
import toast from 'react-hot-toast';
import {BsBoxArrowInUpRight, BsStar, BsStarFill} from 'react-icons/bs';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {useApp} from '../../context/useApp';
import {GetExplorerLink, TruncateAddress} from '../../utils/utils';

export default function StrategyTile({strategy, onClick}) {
	const {selectedProvider} = useSelectedProvider();
	const {favoriteStrategies, setFavoriteStrategies} = useApp();

	function toggleFavorite() {
		return () => {
			setFavoriteStrategies(favorites => {
				const index = favorites.indexOf(strategy.address);
				if(index > -1) {
					favorites.splice(index, 1);
				} else {
					favorites.push(strategy.address);
				}
				return [...favorites];
			});
		};
	}

	return <div className={'vault-tile'}>
		<div onClick={onClick} className={'main'}>
			<div className={'info'}>
				<div className={'title'}>{strategy.name}</div>
				<div className={'chips'}>
					<div className={'chip bg-pink-400 dark:bg-pink-800'}>{'strategy'}</div>
				</div>
			</div>
		</div>
		<div className={'footer'}>
			<div className={'left'} onClick={toggleFavorite()}>
				{!favoriteStrategies.includes(strategy.address) && <>&nbsp;<BsStar />&nbsp;</>}
				{favoriteStrategies.includes(strategy.address) && <>&nbsp;<BsStarFill className={'favorite glow-attention-md'} />&nbsp;</>}
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
				className={'right'}>
				&nbsp;<BsBoxArrowInUpRight />&nbsp;
			</a>
		</div>
	</div>;
}