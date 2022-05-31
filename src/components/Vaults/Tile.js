import React from 'react';
import {BsBoxArrowInUpRight, BsClipboard} from 'react-icons/bs';
import toast from 'react-hot-toast';
import {GetExplorerLink, TruncateAddress} from '../../utils/utils';
import {useFilter} from './useFilter';
import {useApp} from '../../context/useApp';
import StratSummary from './StratSummary';

// import InfoChart from './InfoChart';
	
	


export default function Tile({vault, onClick}) {
	const {queryRe} = useFilter();
	const {strats} = useApp();
	


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
				<div>
					{v_d && <StratSummary vault={v_d}/>  /* <InfoChart name={'PPS'} /> */}
				</div>
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