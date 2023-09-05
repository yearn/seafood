import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {scoreToBorderColor, scoreToTextColor} from './colors';
import {humanizeRiskCategory} from '../../utils/utils';
import {useLocation, useNavigate} from 'react-router-dom';
import {useMediumBreakpoint} from '../../utils/breakpoints';
import {useChrome} from '../Chrome';
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useInteractions,
	useHover,
	useTransitionStyles
} from '@floating-ui/react';

export interface CategoryBreakdown {
	[1]: string,
	[2]: string,
	[3]: string,
	[4]: string,
	[5]: string
}

export interface CategoryBreakdowns {
	TVLImpact: CategoryBreakdown,
	auditScore: CategoryBreakdown,
	codeReviewScore: CategoryBreakdown,
	complexityScore: CategoryBreakdown,
	longevityImpact: CategoryBreakdown,
	protocolSafetyScore: CategoryBreakdown,
	teamKnowledgeScore: CategoryBreakdown,
	testingScore: CategoryBreakdown,
	median: CategoryBreakdown
}

export const breakdowns = {
	TVLImpact: {
		[1]: 'Low: less than USD 1 MM',
		[2]: 'Medium: less than USD 10 MM',
		[3]: 'High: less than USD 50 MM',
		[4]: 'Very high: less than USD 100 MM',
		[5]: 'Extreme: greater than USD 100 MM'
	},
	auditScore: {
		[1]: 'Audit conducted less than 3 months ago by 3 or more independent trusted firms.',
		[2]: 'Audit conducted less than 3 months ago by an independent trusted firm.',
		[3]: 'Audit by trusted firm or security researcher conducted more than 3 months ago.',
		[4]: 'Audit by trusted firm or security researcher conducted more than 6 months ago.',
		[5]: 'No audit by a trusted firm or security researcher.'
	},
	codeReviewScore: {
		[1]: '5 reviewers of the code, (2 strategists peers and 2 security reviewers and either external protocol devs reviewed or external security researchers reviewed)',
		[2]: '4 reviewers of the code (2 peers and 2 internal security devs)',
		[3]: '3 reviewers of the code, the most recent of which was done 3+ months ago (1 of the reviewers is an internal security dev)',
		[4]: '2 reviewers of the code, the most recent of which was done 3+ months ago',
		[5]: '0 - 1 reviewer of the code only or most recent was done 6 months+ ago'
	},
	complexityScore: {
		[1]: 'Strategy is easy to understand, and can be migrated/unwound easily. No leverage and no publicly accessible methods. Highly unlikely to incur losses.',
		[2]: 'Strategy is relatively simple, and is easy to migrate/unwind. Has a health check',
		[3]: 'Has potential for losses, withdrawal fees, or requires detailed queue management to prevent losses. No health check available',
		[4]: 'Uses leverage or debt, and is not easy to unwind. No health check available',
		[5]: 'Strategy is highly complex, uses leverage or debt, and is not easy to unwind. No health check available'
	},
	longevityImpact: {
		[1]: 'Code has been running for 8+ months with no critical issues and no changes in code base',
		[2]: 'Code has been running for 4+ months',
		[3]: 'Code has been running between 1-4 months',
		[4]: 'Code has been running for less than one month',
		[5]: 'Code is new and did not go to ape tax before going live on yearn.fi'
	},
	protocolSafetyScore: {
		[1]: 'Protocols involved in contracts are trusted blue chip protocols with a good track record of security. For example: Maker, Uniswap, Curve, AAVE, and Compound. These protocols meet all the criteria specified in item 2 and more.',
		[2]: 'DD took place. Protocol contracts are audited/verified by at least two reputable audit firms. A multisig with an appropriate threshold is required and/or contracts are immutable. Has a good bounty program.',
		[3]: 'DD took place. Protocol contracts are audited/verified by at least one reputable audit firm. A multisig with an appropriate threshold is required and/or contracts are immutable. Has a good bounty program.',
		[4]: 'DD took place. Protocol contracts audited/verified. A multisig is required or contracts are upgradable. Multisig has a low threshold of signers. No bounty program.',
		[5]: 'No due diligence (DD) document for this strategy. The protocol contracts used are very recent and not audited/verified. An EOA (externally owned account) owns the contracts and can upgrade them.'
	},
	teamKnowledgeScore: {
		[1]: 'A team of 3+ strategists are very familiar with the strategy code and the protocol the strategy is utilising.',
		[2]: '2 strategists have in-depth knowledge, and 1 strategist is somewhat familiar with the strategy code.',
		[3]: '2 strategists have in-depth knowledge of the strategy code.',
		[4]: '1 strategist has in-depth knowledge, and 1 strategist is somewhat familiar with the strategy code.',
		[5]: '1 person in the team is the only one that has in-depth knowledge of the strategy code'
	},
	testingScore: {
		[1]: 'Over 90% coverage in testing. Second developer validated and added tests and also added new ones for uncovered cases while reviewing. You can pull the repository and the tests are currently passing',
		[2]: 'Over 80% coverage',
		[3]: '40% to 80% coverage',
		[4]: 'Less than 40% coverage in testing',
		[5]: 'Less than 20% coverage in testing'
	},
	median: {
		[1]: '',
		[2]: '',
		[3]: '',
		[4]: '',
		[5]: ''
	}
} as CategoryBreakdowns;

const riskScoreTranslations = [
	'safest',
	'safe',
	'risky',
	'riskier',
	'riskiest'
];

export function translateRiskScore(score: 1 | 2 | 3 | 4 | 5) {
	return riskScoreTranslations[score - 1];
}

const tvlImpactTranslations = [
	'low',
	'medium',
	'high',
	'very high',
	'extreme'
];

export function translateTvlImpact(score: 0 | 1 | 2 | 3 | 4 | 5) {
	if(score === 0) return 'none';
	return tvlImpactTranslations[score - 1];
}

export function useFloatie(
	group: string, 
	category: string,
	score: number,
	placement: 'left' | 'right'
) {
	const location = useLocation();
	const navigate = useNavigate();
	const mediumBreakpoint = useMediumBreakpoint();
	const {setDialog} = useChrome();
	const [open, setOpen] = useState(false);
	const breakdown = breakdowns[category as keyof CategoryBreakdowns];

	const hash = useMemo(() => {
		return `${group.replace(/ /g, '')}-${category}`.toLowerCase();
	}, [group, category]);

	const openModal = useCallback(() => {
		if(mediumBreakpoint) return;
		navigate(`${location.pathname}#${hash}`);
	}, [mediumBreakpoint, location, navigate, hash]);

	useEffect(() => {
		if(location.hash === `#${hash}`) {
			setDialog({
				Component: Score,
				args: {group, category, score, breakdown}
			});
		}
	}, [location, setDialog, group, category, score, breakdown, hash]);

	const {strategy, x, y, context, refs} = useFloating({
		open,
		placement,
		onOpenChange: setOpen,
		middleware: [
			offset(16),
			flip({fallbackAxisSideDirection: 'end'}),
			shift()
		],
		whileElementsMounted: autoUpdate
	});

	const hover = useHover(context, {
		restMs: 150
	});

	const {getReferenceProps, getFloatingProps} = useInteractions([
		hover
	]);

	const {styles: transitionStyles} = useTransitionStyles(context, {
		duration: 200
	});

	const style = useMemo(() => {
		return {
			...transitionStyles,
			position: strategy,
			top: y ?? 0,
			left: x ?? 0
		};
	}, [transitionStyles, strategy, x, y]);

	return {
		context,
		style,
		getReferenceProps, 
		getFloatingProps,
		refs,
		open,
		openModal
	};
}

export default function Score({
	group, 
	category,
	score
}: {
	group?: string, 
	category: string,
	score: number
}) {
	const breakdown = breakdowns[category as keyof CategoryBreakdowns];
	if(!breakdown) return <div>{'!breakdown ' + category}</div>;

	return <div className={'p-4'}>
		{group && <div className={'pl-4 text-sm'}>{group}</div>}
		<div className={'pl-4 font-bold text-lg capitalize'}>
			{`${humanizeRiskCategory(category)}${category !== 'TVLImpact' ? ' Score' : ''}`}
		</div>
		{category === 'median' && <div className={'pl-4 text-xs'}>{'Excluding TVL impact'}</div>}
		<div className={'pt-8 sm:pt-4 flex flex-col gap-4 sm:gap-2'}>
			{Object.keys(breakdown).map(key => <div key={key} className={`
				min-h-[52px] py-1 px-4 text-xs flex items-center gap-4
				${category === 'median' ? 'justify-center' : ''}
				${Math.ceil(score) === parseInt(key) ? 'border-2 ' + scoreToBorderColor(score) : ''}`}>
				{category !== 'TVLImpact' && <div className={'min-w-[64px] flex flex-col items-center justify-center'}>
					<div className={`font-bold font-mono text-xl ${scoreToTextColor(parseInt(key))}`}>{key}</div>
					<div className={`text-base ${scoreToTextColor(parseInt(key))}`}>{translateRiskScore(parseInt(key) as 1 | 2 | 3 | 4 | 5)}</div>
				</div>}
				{breakdown[parseInt(key) as 1 | 2 | 3 | 4 | 5]}
			</div>)}
		</div>
	</div>;
}
