import React from 'react';
import toast from 'react-hot-toast';
import {BsBoxArrowInUpRight, BsClipboard} from 'react-icons/bs';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {GetExplorerLink, TruncateAddress} from '../../utils/utils';

export default function StrategyTile({strategy, onClick}) {
	const {selectedProvider} = useSelectedProvider();

	return <div className={'vault-tile'}>
		<div onClick={onClick} className={'main'}>
			<div className={'info'}>
				<div className={'title'}>{strategy.name}</div>
				<div className={'chips'}>
					<div className={'chip bg-pink-400 dark:bg-pink-800'}>{'strategy'}</div>
				</div>
			</div>
			<div className={'avatar'}>
			</div>
		</div>
		<div className={'footer'}>
			<div onClick={() => {
				toast(`${strategy.address} copied to your clipboard`);
				navigator.clipboard.writeText(strategy.address);
			}}
			className={'left'}
			title={`Copy ${strategy.address} to your clipboard`}>
				<BsClipboard className={'icon'} />
				{TruncateAddress(strategy.address)}
			</div>
			<a title={`Explore ${strategy.address}`}
				href={GetExplorerLink(selectedProvider.network.chainId, strategy.address)}
				target={'_blank'} rel={'noreferrer'}
				className={'right'}>
				<BsBoxArrowInUpRight />
				{'Explore'}
			</a>
		</div>
	</div>;
}