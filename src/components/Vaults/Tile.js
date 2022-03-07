import React from 'react';
import {BsBoxArrowInUpRight, BsClipboardPlus} from 'react-icons/bs';
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
		<div onClick={onClick} className={'title-button'}>
			<div className={'title'}>{styleTitle(vault.name)}</div>
			<div className={'version'}>{vault.version}</div>
		</div>
		<div className={'flex items-center justify-between'}>
			<div className={'flex items-center address'}>
				<div onClick={() => {
					toast(`${vault.address} copied to your clipboard`);
					navigator.clipboard.writeText(vault.address);
				}}
				className={'copy'}
				title={`Copy ${vault.address} to your clipboard`}>
					{TruncateAddress(vault.address)}
					{vault.icon}
					<BsClipboardPlus className={'icon'} />
				</div>
				<a title={`Explore ${vault.address}`}
					href={GetExplorerLink(vault.provider.network.chainId, vault.address)}
					target={'_blank'} rel={'noreferrer'}
					className={'sm-circle-icon-button'}>
					<BsBoxArrowInUpRight />
				</a>
			</div>
			<div className={`network ${vault.provider.network.name}`}>{vault.provider.network.name}</div>
		</div>
	</div>;
}