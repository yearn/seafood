import React, {useCallback, useMemo, useState} from 'react';
import {TbCopy, TbCheck, TbGitPullRequest} from 'react-icons/tb';
import useScrollOverpass from '../../context/useScrollOverpass';
import {Button, Input, TextArea} from '../controls';
import {useAuth} from '../../context/useAuth';
import * as gh from '../../utils/github';
import {useDebouncedCallback} from 'use-debounce';

export default function Code({vault, debtRatioUpdates}) {
	const [copied, setCopied] = useState(false);
	const {showClassName} = useScrollOverpass();
	const {bearer} = useAuth();

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
		const lines = ['@sign'];
		if(updates.length) {
			updates.sort((a, b) => a.delta > b.delta ? 1 : -1);
			lines.push('def auto_debt_adjust():');
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
			lines.push('\n');
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
			body.push(update.address);
			body.push(update.name);
			body.push(`Change debt ratio by ${update.delta > 0 ? '+' : ''}${update.delta} bps`);
			body.push('');
		});
		return {
			headline: `${vault?.name} Debt Ratio Updates`,
			body: body.join('\n')
		};
	}, [vault, updates]);

	const [headline, setHeadline] = useState(defaultCommitMessage.headline);
	const debounceHeadline = useDebouncedCallback(value => {setHeadline(value);}, 250);
	const [body, setBody] = useState(defaultCommitMessage.body);
	const debounceBody = useDebouncedCallback(value => {setBody(value);}, 250);
	const commitMessage = useMemo(() => ({headline, body}), [headline, body]);

	const onPr = useCallback(async () => {
		const fake = Math.floor(Math.random() * 1_000_000).toString();
		const owner = 'murderteeth';
		const repo = 'fishtank';
		const branchName = fake;
		const path = `vault-migrations/${fake}.py`;
		const main = await gh.getRef(bearer, owner, repo, 'refs/heads/main');
		const branch = await gh.createRef(bearer, main, branchName);
		await gh.createCommitOnBranch(bearer, branch, commitMessage, {
			additions: [{
				path,
				contents: window.btoa(linesOfCode.join('\n'))
			}]
		});
		const compareUrl = gh.makeCompareUrl(branch);
		window.open(compareUrl, '_blank', 'noreferrer');
	}, [bearer, linesOfCode, commitMessage]);

	return <div className={'relative w-full h-full'}>
		<div className={'max-h-full px-4 sm:px-8 pt-12 pb-24 flex flex-col overflow-x-auto'}>
			<div className={'py-4 flex flex-col gap-4'}>
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
					rounded-md shadow-inner`} />
			</div>
			<div className={`
				py-4 border border-gray-300 dark:border-gray-800
				overflow-x-scroll rounded-md`}>
				{linesOfCode.map((line, index) => 
					<div key={index} className={'flex items-center'}>
						<div className={'ml-2 mr-4 w-8 min-w-[2rem] text-right dark:text-secondary-400/60'}>{''}{index + 1}</div>
						<div className={'whitespace-nowrap'}>
							{Array.from(line).filter(c => c === '\t').map((_, index) => <span key={index}>&emsp;</span>)}
							{line.replace('\t', '')}
						</div>
					</div>
				)}
			</div>
		</div>

		<div className={`
			absolute bottom-0 w-full px-4 py-4
			flex items-center justify-end gap-4
			border-t border-white dark:border-secondary-900
			rounded-b-lg
			${showClassName}`}>
			<Button disabled={updates?.length === 0} icon={copied ? TbCheck : TbCopy} onClick={onCopy} className={'w-48'} />
			<Button disabled={updates?.length === 0 || !bearer} icon={TbGitPullRequest} onClick={onPr} className={'w-48'} />
		</div>
	</div>;
}
