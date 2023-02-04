import React, {ReactNode, useState} from 'react';
import {scoreToBgColor, scoreToBorderColor, scoreToTextColor} from '../colors';
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useInteractions,
	FloatingFocusManager,
	useHover,
	useTransitionStyles
} from '@floating-ui/react';
import {humanizeRiskCategory} from '../../../utils/utils';

interface CategoryBreakdown {
	[1]: string,
	[2]: string,
	[3]: string,
	[4]: string,
	[5]: string
}

interface CategoryBreakdowns {
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

const breakdowns = {
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
		[5]: 'Code is new and did not go to ape tax before going live on yearn.finance'
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
	'safer',
	'safe',
	'risky',
	'riskiest'
];

function translateRiskScore(score: 1 | 2 | 3 | 4 | 5) {
	return riskScoreTranslations[score - 1];
}

export default function Cell({
	group,
	category,
	score, 
	className, 
	children
} : {
	group: string,
	category: string,
	score: number, 
	className?: string, 
	children?: ReactNode
}) {
	const [open, setOpen] = useState(false);
	const breakdown = breakdowns[category as keyof CategoryBreakdowns];

	const {x, y, refs, strategy, context} = useFloating({
		open,
		placement: 'left',
		onOpenChange: setOpen,
		middleware: [
			offset(2),
			flip({fallbackAxisSideDirection: 'end'}),
			shift()
		],
		whileElementsMounted: autoUpdate
	});

	const hover = useHover(context);

	const {getReferenceProps, getFloatingProps} = useInteractions([
		hover
	]);

	const {styles} = useTransitionStyles(context, {
		duration: 200
	});

	return <div ref={refs.setReference} {...getReferenceProps()} className={`
		h-16 flex items-center justify-center rounded-sm cursor-default
		${scoreToBgColor(score)} ${className}`}>
		{children}
		{open && <FloatingFocusManager context={context} modal={false}>
			<div ref={refs.setFloating} {...getFloatingProps()} className={`
				z-[100] w-96 p-4
				flex flex-col
				bg-secondary-100 dark:bg-secondary-900
				shadow-md rounded-lg
				transition duration-200
        ${className}`}
			style={{
				...styles,
				position: strategy,
				top: y ?? 0,
				left: x ?? 0
			}}>
				<div className={'pl-4 text-sm'}>{group}</div>
				<div className={'pl-4 font-bold text-lg capitalize'}>{`${humanizeRiskCategory(category)} Score`}</div>
				{Object.keys(breakdown).map(key => <div key={key} className={`
					py-1 px-4 text-xs flex items-center gap-4 rounded-lg
					${Math.ceil(score) === parseInt(key) ? 'border-2 ' + scoreToBorderColor(score) : ''}`}>
					<div className={'min-w-[64px] flex flex-col items-center justify-center'}>
						<div className={`font-bold text-xl ${scoreToTextColor(parseInt(key))}`}>{key}</div>
						<div className={`text-base ${scoreToTextColor(parseInt(key))}`}>{translateRiskScore(parseInt(key) as 1 | 2 | 3 | 4 | 5)}</div>
					</div>
					{breakdown[parseInt(key) as 1 | 2 | 3 | 4 | 5]}
				</div>)}
			</div>
		</FloatingFocusManager>}
	</div>;
}
