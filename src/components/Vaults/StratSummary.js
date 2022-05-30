import React from 'react';


export default function StratSummary({vault}) {
	
	return <div>
		{vault.strats.length + ' strategies - '}
		{(vault.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}{'% Allocated - Free Assets: '}{((vault.totalAssets - vault.totalDebt) / (10 ** vault.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}
	</div>;
}