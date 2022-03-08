import React from 'react';
import toast from 'react-hot-toast';
import {BsBoxArrowInUpRight, BsClipboardPlus} from 'react-icons/bs';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {GetExplorerLink, TruncateAddress} from '../../utils/utils';

export default function StrategyTile({strategy, onClick}) {
	const {selectedProvider} = useSelectedProvider();
	return <div className={'vault-tile'}>
		<div onClick={onClick} className={'title-button'}>
			<div className={'title-sm'}>{strategy.name}</div>
			<div className={'chip bg-pink-800'}>{'strategy'}</div>
		</div>
		<div className={'flex items-center justify-between'}>
			<div className={'flex items-center address'}>
				<div onClick={() => {
					toast(`${strategy.address} copied to your clipboard`);
					navigator.clipboard.writeText(strategy.address);
				}}
				className={'copy'}
				title={`Copy ${strategy.address} to your clipboard`}>
					{TruncateAddress(strategy.address)}
					<BsClipboardPlus className={'icon'} />
				</div>
				<a title={`Explore ${strategy.address}`}
					href={GetExplorerLink(selectedProvider.network.chainId, strategy.address)}
					target={'_blank'} rel={'noreferrer'}
					className={'sm-circle-icon-button'}>
					<BsBoxArrowInUpRight />
				</a>
			</div>
		</div>
	</div>;
}