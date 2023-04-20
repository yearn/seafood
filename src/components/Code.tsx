import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {BiGitBranch, BiGitPullRequest} from 'react-icons/bi';
import {Button, Input, Spinner, TextArea} from './controls';
import {useAuth} from '../context/useAuth';
import {GithubClient} from '../utils/github';
import dayjs from 'dayjs';
import config from '../config.json';
import {useSms} from '../context/useSms';
import {fetchAbi} from '../utils/utils';
import {Block, functions} from '../context/useSimulator/Blocks';
import {useVaults} from '../context/useVaults';
import {Strategy, Vault} from '../context/useVaults/types';

interface Commit {
	title: string,
	body: string[],
	code: string[]
}

function primitives(vaults: Vault[], block: Block) {
	let vault: Vault | undefined;
	let strategy: Strategy | undefined;

	if(block.primitive === 'vault') {
		vault = vaults.find(v => v.network.chainId === block.chain && v.address === block.contract);
		if(!vault) throw '!vault';
		strategy = vault.strategies.find(s => s.address === block.call.input[0]);
		if(!strategy) throw '!strategy';
	} else {
		strategy = vaults.filter(v => v.network.chainId === block.chain)
			.flatMap(v => v.strategies)
			.find(s => s.address === block.contract);
		if(!strategy) throw '!strategy';
		vault = vaults.find(v => 
			v.network.chainId === strategy?.network.chainId
			&& v.strategies.some(s => s.address === strategy?.address));
		if(!vault) throw '!vault';
	}

	return {vault, strategy} as {vault: Vault, strategy: Strategy};
}

function useCommitGenerator(blocks: Block[]) {
	const {vaults} = useVaults();
	const [busy, setBusy] = useState(false);
	const [commit, setCommit] = useState<Commit | undefined>();

	const getVaultHeader = useCallback((vault: Vault) => {
		const result = [] as string[];
		result.push('');
		result.push(`\t# ~ ~ ~ ${vault.name} ~ ~ ~ <*)))><`);
		const hasDrs = blocks.some(b => 
			b.primitive === 'vault' 
			&& b.chain === vault.network.chainId
			&& b.contract === vault.address 
			&& b.call.signature === functions.vaults.updateDebtRatio.signature);
		if(hasDrs) result.push(`\tvault = safe.contract("${vault.address}")`);
		result.push('');
		return result;
	}, [blocks]);

	const getStrategyHeader = useCallback((strategy: Strategy) => {
		const result = [] as string[];
		result.push(`\t# ${strategy.name}`);
		result.push(`\tstrategy = safe.contract("${strategy.address}")`);
		return result;
	}, []);

	const commitPromise = useMemo(async () => {
		const functionDef = ['', '@sign'];
		if(!blocks.length) return {title: '', body: [] as string[], code: [...functionDef]};

		setBusy(true);
		const result = {title: '', body: [] as string[], code: [] as string[]};
		const touchedVaults = [] as Vault[];
		const touchedStrategies = [] as Strategy[];
		const variables = [] as string[];
		const tasks = [] as string[];
		let hasManualHarvests = false;
		functionDef.push('def eat_your_seafood():');

		for(const block of blocks) {
			const {vault, strategy} = primitives(vaults, block);
			if(!touchedVaults.includes(vault)) {
				tasks.push(...getVaultHeader(vault));
				touchedVaults.push(vault);
			}

			if(block.primitive === 'strategy' &&!touchedStrategies.includes(strategy)) {
				tasks.push(...getStrategyHeader(strategy));
				touchedStrategies.push(strategy);
			}

			switch(`${block.primitive}/${block.call.signature}`) {
			case `vault/${functions.vaults.updateDebtRatio.signature}`: {
				const update = block.call.input[1] as number;
				const delta = update - (strategy.debtRatio?.toNumber() || 0);
				result.body.push(strategy.name);
				result.body.push(`change debt ratio by ${delta > 0 ? '+' : ''}${delta} bps`);
				result.body.push('');
				tasks.push(`\t# ${strategy.name}`);
				tasks.push(`\t# Change debt ratio by ${delta > 0 ? '+' : ''}${delta} bps`);
				tasks.push(`\tstrategy = safe.contract("${strategy.address}")`);
				tasks.push(`\tvault.updateStrategyDebtRatio(strategy, ${update})`);

				touchedStrategies.push(strategy);
				break;

			} case `strategy/${functions.strategies.setDoHealthCheck.signature}`: {
				result.body.push(`setDoHealthCheck(${Boolean(block.call.input[0])}) ${strategy.name}`);
				const doHealthCheck = block.call.input[0] ? 'True' : 'False';
				tasks.push(`\tstrategy.setDoHealthCheck(${doHealthCheck})`);
				break;

			} case `strategy/${functions.strategies.harvest.signature}`: {
				result.body.push(`harvest ${strategy.name}`);
				const abi = await fetchAbi(strategy.network.chainId, strategy.address);
				const autoHarvest = abi.some((f: {name: string}) => f.name === 'setForceHarvestTriggerOnce');

				tasks.push(autoHarvest
					? '\tstrategy.setForceHarvestTriggerOnce(True)'
					: '\tmanual_harvest_strategies.append(strategy)');
				tasks.push('');

				if(!autoHarvest) hasManualHarvests = true;
				break;
			}}
		}

		if(hasManualHarvests) {
			variables.push('');
			variables.push('\tmanual_harvest_strategies = []');
			tasks.push('\tharvest_n_check_many(safe, manual_harvest_strategies)');
			tasks.push('');
		}

		if(touchedVaults.length) {
			result.title = `feat: Change debt ratios, ${touchedVaults.map(v => v.name).join(', ')}`;
		} else {
			result.title = `feat: Harvests, ${touchedStrategies.map(s => s.name).join(', ')}`;
		}

		setBusy(false);
		return {...result, code: [...functionDef, ...variables, ...tasks]};
	}, [blocks, setBusy, vaults, getVaultHeader, getStrategyHeader]);

	useEffect(() => {
		commitPromise.then(result => setCommit(result));
	}, [commitPromise, setCommit]);

	return {busy, commit};
}

export default function Code({blocks}: {blocks: Block[]}) {
	const [copied, setCopied] = useState(false);
	const {authenticated, token, profile} = useAuth();
	const sms = useSms();
	const [defaultBranchName, setDefaultBranchName] = useState(`${config.sms.repo}/refs/heads/seafood/`);
	const [onPrRunning, setOnPrRunning] = useState(false);
	const headlineRef = useRef<HTMLInputElement>({} as HTMLInputElement);
	const bodyRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
	const {commit, busy} = useCommitGenerator(blocks);

	const linesOfCode = useMemo(() => {
		if(!commit) return [];
		return commit.code;
	}, [commit]);

	const gh = useMemo(() => {
		if(!(authenticated && token)) return;
		return new GithubClient(token.access_token);
	}, [authenticated, token]);


	const onCopy = useCallback(() => {
		try {
			navigator.clipboard.writeText(linesOfCode.join('\n'));
		} finally {
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 2500);
		}
	}, [linesOfCode, setCopied]);

	const nextBranchName = useCallback(async () => {
		if(!(profile && gh)) return '';
		const today = dayjs(new Date()).format('MMM-DD').toLowerCase();
		const prefix = `refs/heads/seafood/${profile.login}/${today}/`;
		const refs = await gh.getRefs(config.sms.owner, config.sms.repo, prefix);
		const nonce = Math.max(0, ...refs.map(ref => parseInt(ref.name))) + 1;
		return `seafood/${profile.login}/${today}/${nonce}`;
	}, [gh, profile]);

	useEffect(() => {
		nextBranchName().then(branch => 
			setDefaultBranchName(`${config.sms.repo}/refs/heads/${branch}`));
	}, [nextBranchName]);

	const commitMessage = useCallback(() => {
		return {
			headline: headlineRef.current?.value || '',
			body: bodyRef.current?.value || ''
		};
	}, []);

	const onPr = useCallback(async () => {
		if(!gh) return;
		setOnPrRunning(true);
		const main = await gh.getRef(config.sms.owner, config.sms.repo, `refs/heads/${config.sms.main}`);
		const branch = await gh.createRef(main, await nextBranchName());
		const newSmsMainPy = `${sms.mainpy.join('\n')}${linesOfCode.join('\n')}\n`;
		await gh.createCommitOnBranch(branch, commitMessage(), {
			additions: [{
				path: config.sms.script,
				contents: window.btoa(unescape(encodeURIComponent(newSmsMainPy)))
			}],
			deletions: []
		});
		const compareUrl = gh.makeCompareUrl(branch);
		window.open(compareUrl, '_blank', 'noreferrer');
		setOnPrRunning(false);
	}, [gh, linesOfCode, sms, nextBranchName, commitMessage]);

	if(busy) return <div className={'w-full h-full flex items-center justify-center'}>
		<Spinner width={'3rem'} height={'3rem'}></Spinner>
	</div>;

	return <div className={'relative w-full h-full'}>
		<div className={'max-h-full px-4 sm:px-8 pt-12 pb-20 flex flex-col overflow-x-auto'}>
			{sms.access && <>
				<div className={'flex items-center text-xs gap-1 text-primary-600'}>
					<BiGitBranch />
					<div>{defaultBranchName}</div>
				</div>
				<div className={'pt-2 flex flex-col gap-4'}>
					<Input _ref={headlineRef}
						type={'text'}
						placeholder={'Pull Request Title'}
						defaultValue={commit?.title || ''}
						className={`
						py-2 px-2 inline border-transparent leading-tight
						text-xl bg-gray-300 dark:bg-gray-800
						focus-visible:outline focus-visible:outline-1
						focus-visible:outline-primary-400 focus-visible:dark:outline-selected-600
						focus:ring-0 focus:border-primary-400 focus:bg-gray-200
						focus:dark:border-selected-600
						shadow-inner`} />
					<TextArea _ref={bodyRef}
						defaultValue={commit?.body.join('\n') || ''}
						spellCheck={false}
						className={`
						h-32 p-4 inline border-transparent leading-tight text-sm
						bg-gray-300 dark:bg-gray-800
						focus:ring-0 focus:border-primary-400 focus:bg-gray-200
						focus:dark:border-selected-600
						shadow-inner resize-none`} />
				</div>
				<div className={'py-2 text-xs text-primary-600'}>{config.sms.script}</div>			
			</>}
			<div className={`
				py-4 border border-gray-300 dark:border-gray-800
				overflow-x-auto override-scroll`}>
				{sms.access && (sms.mainpy || ['', '', '', '']).slice(-4, -1).map((line, index) => 
					<div key={index} className={'flex items-center'}>
						<div className={`
							ml-2 mr-4 w-16
							font-mono text-right opacity-30 dark:text-secondary-400
							whitespace-nowrap`}>
							{sms.mainpy?.length + index + 1 - 4}&nbsp;&nbsp;
						</div>
						<div className={'whitespace-nowrap opacity-40'}>
							{Array.from(line).filter(c => c === '\t').map((_, index) => <span key={index}>&emsp;</span>)}
							{line.replace('\t', '')}
						</div>
					</div>
				)}
				{linesOfCode.map((line, index) => 
					<div key={index} className={'flex items-center'}>
						<div className={`
							ml-2 mr-4 w-16
							font-mono text-right dark:text-secondary-400/60
							whitespace-nowrap`}>
							{sms.access ? sms.mainpy?.length + index + 1 - 1 : index + 1}{' + '}
						</div>
						<div className={'whitespace-nowrap'}>
							{Array.from(line).filter(c => c === '\t').map((_, index) => <span key={index}>&emsp;</span>)}
							{line.replace('\t', '')}
						</div>
					</div>
				)}
			</div>
		</div>

		<div className={`
			absolute bottom-0 w-full px-4 sm:px-8 py-4
			flex items-center justify-end gap-4
			border-t border-white dark:border-secondary-900`}>
			<Button onClick={onCopy}
				disabled={blocks.length === 0} 
				icon={copied ? TbCheck : TbCopy} 
				className={'w-48'} />
			{sms.access && <Button onClick={onPr}
				busy={onPrRunning} 
				disabled={blocks.length === 0 || !token} 
				icon={BiGitPullRequest}
				className={'w-48'} />}
		</div>
	</div>;
}
