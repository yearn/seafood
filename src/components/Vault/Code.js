import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {BiGitBranch, BiGitPullRequest} from 'react-icons/bi';
import {Button, Input, TextArea} from '../controls';
import {useAuth} from '../../context/useAuth';
import {GithubClient} from '../../utils/github';
import {useDebouncedCallback} from 'use-debounce';
import dayjs from 'dayjs';
import config from '../../config.json';

export default function Code({vault, debtRatioUpdates}) {
	const [copied, setCopied] = useState(false);
	const {bearer, profile} = useAuth();
	const gh = useMemo(() => new GithubClient(bearer), [bearer]);

	const updates = useMemo(() => {
		const result = [];
		vault?.withdrawalQueue.forEach(strategy => {
			const debtRatioUpdate = debtRatioUpdates[strategy.address];
			if(debtRatioUpdate !== undefined) {
				const delta =  debtRatioUpdate - strategy.debtRatio;
				result.push({
					address: strategy.address,
					name: strategy.name,
					debtRatio: debtRatioUpdate,
					delta
				});
			}
		});
		return result;
	}, [vault, debtRatioUpdates]);

	const linesOfCode = useMemo(() => {
		const lines = ['', '@sign'];
		if(updates.length) {
			updates.sort((a, b) => a.delta > b.delta ? 1 : -1);
			lines.push('def go_seafood():');
			lines.push('\tstrategies=[]');
			lines.push('');
			lines.push(`\t# ${vault.name}`);
			lines.push(`\tvault = safe.contract("${vault.address}")`);
			updates.forEach(update => {
				lines.push('');
				lines.push(`\t# ${update.name}`);
				lines.push(`\t# Change debt ratio by ${update.delta > 0 ? '+' : ''}${update.delta} bps`);
				lines.push(`\tstrategy = safe.contract("${update.address}")`);
				lines.push(`\tvault.updateStrategyDebtRatio(strategy, ${update.debtRatio})`);
				lines.push('\tstrategies.append(strategy)');
			});
			lines.push('');
			lines.push('\tharvest_n_check_many(safe, strategies)');
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

	const [headline, setHeadline] = useState(defaultCommitMessage.headline);
	const debounceHeadline = useDebouncedCallback(value => {setHeadline(value);}, 250);
	const [body, setBody] = useState(defaultCommitMessage.body);
	const debounceBody = useDebouncedCallback(value => {setBody(value);}, 250);
	const commitMessage = useMemo(() => ({headline, body}), [headline, body]);

	const nextBranchName = useCallback(async () => {
		const today = dayjs(new Date()).format('MMM-DD');
		const prefix = `refs/heads/seafood/${profile.name}/${today}/`;
		const refs = await gh.getRefs(config.sms.owner, config.sms.repo, prefix);
		const nonce = Math.max(0, ...refs.map(ref => parseInt(ref.name))) + 1;
		return `seafood/${profile.name}/${today}/${nonce}`;
	}, [gh, profile]);

	const [defaultBranchName, setDefaultBranchName] = useState(`${config.sms.repo}/refs/heads/seafood/`);
	useEffect(() => {
		nextBranchName().then(branch => 
			setDefaultBranchName(`${config.sms.repo}/refs/heads/${branch}`));
	}, [nextBranchName]);

	const smsScriptExpression = `${config.sms.main}:${config.sms.script}`;
	const [smsMain, setSmsMain] = useState();
	useEffect(() => {
		gh.getObjectText(config.sms.owner, config.sms.repo, smsScriptExpression).then(
			main => setSmsMain(main.split('\n')));
	}, [gh, smsScriptExpression]);

	const onPr = useCallback(async () => {
		const main = await gh.getRef(config.sms.owner, config.sms.repo, `refs/heads/${config.sms.main}`);
		const branch = await gh.createRef(main, await nextBranchName());
		const newSmsMain = `${smsMain.join('\n')}${linesOfCode.join('\n')}\n`;
		await gh.createCommitOnBranch(branch, commitMessage, {
			additions: [{
				path: config.sms.script,
				contents: window.btoa(unescape(encodeURIComponent(newSmsMain)))
			}]
		});
		const compareUrl = gh.makeCompareUrl(branch);
		window.open(compareUrl, '_blank', 'noreferrer');
	}, [linesOfCode, smsMain, commitMessage, gh, nextBranchName]);

	return <div className={'relative w-full h-full'}>
		<div className={'max-h-full px-4 sm:px-8 pt-12 pb-20 flex flex-col overflow-x-auto'}>
			<div className={'flex items-center text-xs gap-1 text-primary-600'}>
				<BiGitBranch />
				<div>{defaultBranchName}</div>
			</div>
			<div className={'pt-2 flex flex-col gap-4'}>
				<Input
					placeholder={'Pull Request Title'}
					defaultValue={defaultCommitMessage.headline}
					onChange={(e) => debounceHeadline(e.target.value)}
					className={`
					py-2 px-2 inline border-transparent leading-tight
					text-xl bg-gray-300 dark:bg-gray-800
					focus-visible:outline focus-visible:outline-1
					focus-visible:outline-primary-400 focus-visible:dark:outline-selected-600
					focus:ring-0 focus:border-primary-400 focus:bg-gray-200
					focus:dark:border-selected-600
					rounded-md shadow-inner`} />
				<TextArea 
					defaultValue={defaultCommitMessage.body}
					onChange={(e) => debounceBody(e.target.value)}
					spellCheck={false}
					className={`
					h-32 p-4 inline border-transparent leading-tight text-sm
					bg-gray-300 dark:bg-gray-800
					focus:ring-0 focus:border-primary-400 focus:bg-gray-200
					focus:dark:border-selected-600
					rounded-md shadow-inner resize-none`} />
			</div>
			<div className={'py-2 text-xs text-primary-600'}>{config.sms.script}</div>
			<div className={`
				py-4 border border-gray-300 dark:border-gray-800
				overflow-x-scroll rounded-md`}>
				{(smsMain || ['', '', '', '']).slice(-4, -1).map((line, index) => 
					<div key={index} className={'flex items-center'}>
						<div className={`
							ml-2 mr-4
							font-mono text-right opacity-30 dark:text-secondary-400
							whitespace-nowrap`}>
							{smsMain?.length + index + 1 - 4}&nbsp;&nbsp;
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
							ml-2 mr-4
							font-mono text-right dark:text-secondary-400/60
							whitespace-nowrap`}>
							{smsMain?.length + index + 1 - 1}{' + '}
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
			<Button disabled={updates?.length === 0} icon={copied ? TbCheck : TbCopy} onClick={onCopy} className={'w-48'} />
			<Button disabled={updates?.length === 0 || !bearer} icon={BiGitPullRequest} onClick={onPr} className={'w-48'} />
		</div>
	</div>;
}
