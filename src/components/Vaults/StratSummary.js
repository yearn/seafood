import React from 'react';


export default function StratSummary({vault}) {
	
	return <div className={'internal-avatar'}>
		<p>{vault.strats.length + ' strategies'}</p>
		<p>{(vault.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}{'% Allocated'}</p> 
		<p> {((vault.totalAssets - vault.totalDebt) / (10 ** vault.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}{' Free'}</p>
	</div>;
}