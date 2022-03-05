import React from 'react';
import {BsBoxArrowInUpRight, BsClipboardPlus} from 'react-icons/bs';
import {GetExplorerLink, TruncateAddress} from '../../utils/utils';
import toast from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';
import {useFilter} from './useFilter';

export default function List() {
	const navigate = useNavigate();
	const {queryRe, filter} = useFilter();

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

	return <div className={'list'}>
		{filter.map(vault => {
			return <div key={vault.address} className={'tile'}>
				<div onClick={() => {navigate(`/vault/${vault.address}`);}} className={'title-button'}>
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
							<BsClipboardPlus className={'icon'} />
						</div>
						<a title={`Explore ${vault.address}`}
							href={GetExplorerLink(vault.provider.network.chainId, vault.address)}
							className={'sm-circle-icon-button'}>
							<BsBoxArrowInUpRight />
						</a>
					</div>
					<div className={`network ${vault.provider.network.name}`}>{vault.provider.network.name}</div>
				</div>
			</div>;
		})}
	</div>;
}