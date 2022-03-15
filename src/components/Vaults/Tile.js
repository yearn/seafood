import React from 'react';
import {BsBoxArrowInUpRight, BsClipboard} from 'react-icons/bs';
import toast from 'react-hot-toast';
import {GetExplorerLink, TruncateAddress} from '../../utils/utils';
import {useFilter} from './useFilter';

export default function Tile({vault, onClick}) {
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

	return <div className={'vault-tile'}>
		<div onClick={onClick} className={'main'}>
			<div className={'info'}>
				<div className={'title'}>{styleTitle(vault.name)}</div>
				<div className={'chips'}>
					<div className={'chip version'}>{vault.version}</div>
					<div className={`chip ${vault.provider.network.name}`}>{vault.provider.network.name}</div>
				</div>
			</div>
			<div className={'avatar'}>
				<div></div>
			</div>
		</div>
		<div className={'footer'}>
			<div onClick={() => {
				toast(`${vault.address} copied to your clipboard`);
				navigator.clipboard.writeText(vault.address);
			}}
			className={'left'}
			title={`Copy ${vault.address} to your clipboard`}>
				<BsClipboard className={'icon'} />
				{TruncateAddress(vault.address)}
			</div>
			<a title={`Explore ${vault.address}`}
				href={GetExplorerLink(vault.provider.network.chainId, vault.address)}
				target={'_blank'} rel={'noreferrer'}
				className={'right'}>
				<BsBoxArrowInUpRight />
				{'Explore'}
			</a>		
		</div>
	</div>;
}