import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {BiGitBranch, BiGitPullRequest} from 'react-icons/bi';
import {Button, Input, Spinner, TextArea} from '../controls';
import {useAuth} from '../../context/useAuth';
import {GithubClient} from '../../utils/github';
import dayjs from 'dayjs';
import config from '../../config.json';
import {useSms} from '../../context/useSms';
import {getAbi} from '../../utils/utils';

function useUpdates(vault, debtRatioUpdates) {
	const [busy, setBusy] = useState(false);
	const [updates, setUpdates] = useState([]);

	const updatesPromise = useMemo(async () => {
		const result = [];
		if(!vault) return result;
		for(const strategy of vault.withdrawalQueue) {
			const debtRatioUpdate = debtRatioUpdates[strategy.address];
			if(debtRatioUpdate !== undefined) {
				const delta =  debtRatioUpdate - strategy.debtRatio;
				const abi = await getAbi(strategy.network.chainId, strategy.address);
				const autoHarvest = abi.some(f => f.name === 'setForceHarvestTriggerOnce');
				result.push({
					address: strategy.address,
					name: strategy.name,
					debtRatio: debtRatioUpdate,
					delta,
					autoHarvest
				});
			}
		}
		result.sort((a, b) => a.delta - b.delta);
		return result;
	}, [vault, debtRatioUpdates]);

	useEffect(() => {
		setBusy(true);
		updatesPromise.then(result => {
			setUpdates(result);
			setBusy(false);
		});
	}, [updatesPromise]);

	return {busy, updates};
}

export default function Code({vault, debtRatioUpdates}) {
	const [copied, setCopied] = useState(false);
	const {authenticated, token, profile} = useAuth();
	const sms = useSms();
	const {busy, updates} = useUpdates(vault, debtRatioUpdates);
	const [defaultBranchName, setDefaultBranchName] = useState(`${config.sms.repo}/refs/heads/seafood/`);
	const [onPrRunning, setOnPrRunning] = useState(false);
	const headlineRef = useRef();
	const bodyRef = useRef();

	const gh = useMemo(() => {
		if(!authenticated) return;
		return new GithubClient(token.access_token);
	}, [authenticated, token]);

	const linesOfCode = useMemo(() => {
		const lines = ['', '@sign'];
		if(!updates.length) return lines;

		const hasManualHarvests = updates.some(update => !update.autoHarvest);

		lines.push('def go_seafood():');
		lines.push('');
		lines.push(`\t# ${vault.name}`);
		lines.push(`\tvault = safe.contract("${vault.address}")`);
		lines.push('');
		if(hasManualHarvests) {
			lines.push('\tmanual_harvest_strategies = []');
			lines.push('');
		}

		updates.forEach(update => {
			lines.push(`\t# ${update.name}`);
			lines.push(`\t# Change debt ratio by ${update.delta > 0 ? '+' : ''}${update.delta} bps`);
			lines.push(`\tstrategy = safe.contract("${update.address}")`);
			lines.push(`\tvault.updateStrategyDebtRatio(strategy, ${update.debtRatio})`);
			lines.push(update.autoHarvest 
				? '\tstrategy.setForceHarvestTriggerOnce(True)' 
				: '\tmanual_harvest_strategies.append(strategy)');
			lines.push('');
		});

		if(hasManualHarvests) {
			lines.push('\tharvest_n_check_many(safe, manual_harvest_strategies)');
			lines.push('');
		}
		return lines;
	}, [vault, updates]);

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

	const defaultCommitMessage = useMemo(() => {
		const body = [];
		updates.forEach(update => {
			body.push(update.name);
			body.push(`- change debt ratio by ${update.delta > 0 ? '+' : ''}${update.delta} bps`);
			body.push('');
		});
		return {
			headline: `feat: Change Debt Ratios, ${vault?.name}`,
			body: body.join('\n')
		};
	}, [vault, updates]);

	const nextBranchName = useCallback(async () => {
		if(!authenticated) return;
		const today = dayjs(new Date()).format('MMM-DD').toLowerCase();
		const prefix = `refs/heads/seafood/${profile.login}/${today}/`;
		const refs = await gh.getRefs(config.sms.owner, config.sms.repo, prefix);
		const nonce = Math.max(0, ...refs.map(ref => parseInt(ref.name))) + 1;
		return `seafood/${profile.login}/${today}/${nonce}`;
	}, [authenticated, gh, profile]);

	useEffect(() => {
		nextBranchName().then(branch => 
			setDefaultBranchName(`${config.sms.repo}/refs/heads/${branch}`));
	}, [nextBranchName]);

	const commitMessage = useCallback(() => ({
		headline: headlineRef.current.value,
		body: bodyRef.current.value
	}), []);

	const onPr = useCallback(async () => {
		if(!authenticated) return;
		setOnPrRunning(true);
		const main = await gh.getRef(config.sms.owner, config.sms.repo, `refs/heads/${config.sms.main}`);
		const branch = await gh.createRef(main, await nextBranchName());
		const newSmsMainPy = `${sms.mainpy.join('\n')}${linesOfCode.join('\n')}\n`;
		await gh.createCommitOnBranch(branch, commitMessage(), {
			additions: [{
				path: config.sms.script,
				contents: window.btoa(unescape(encodeURIComponent(newSmsMainPy)))
			}]
		});
		const compareUrl = gh.makeCompareUrl(branch);
		window.open(compareUrl, '_blank', 'noreferrer');
		setOnPrRunning(false);
	}, [authenticated, linesOfCode, sms, gh, nextBranchName, commitMessage]);

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
						placeholder={'Pull Request Title'}
						defaultValue={defaultCommitMessage.headline}
						className={`
						py-2 px-2 inline border-transparent leading-tight
						text-xl bg-gray-300 dark:bg-gray-800
						focus-visible:outline focus-visible:outline-1
						focus-visible:outline-primary-400 focus-visible:dark:outline-selected-600
						focus:ring-0 focus:border-primary-400 focus:bg-gray-200
						focus:dark:border-selected-600
						rounded-md shadow-inner`} />
					<TextArea _ref={bodyRef}
						defaultValue={defaultCommitMessage.body}
						spellCheck={false}
						className={`
						h-32 p-4 inline border-transparent leading-tight text-sm
						bg-gray-300 dark:bg-gray-800
						focus:ring-0 focus:border-primary-400 focus:bg-gray-200
						focus:dark:border-selected-600
						rounded-md shadow-inner resize-none`} />
				</div>
				<div className={'py-2 text-xs text-primary-600'}>{config.sms.script}</div>			
			</>}
			<div className={`
				py-4 border border-gray-300 dark:border-gray-800
				overflow-x-scroll rounded-md`}>
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
			border-t border-white dark:border-secondary-900
			rounded-b-lg`}>
			<Button onClick={onCopy}
				disabled={updates?.length === 0} 
				icon={copied ? TbCheck : TbCopy} 
				className={'w-48'} />
			{sms.access && <Button onClick={onPr}
				busy={onPrRunning} 
				disabled={updates?.length === 0 || !token} 
				icon={BiGitPullRequest}
				className={'w-48'} />}
		</div>
	</div>;
}
