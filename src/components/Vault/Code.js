import React, {useEffect, useState} from 'react';
import {TbCopy, TbCheck} from 'react-icons/tb';
import useScrollOverpass from '../../context/useScrollOverpass';
import {useChrome} from '../Chrome';
import {Button} from '../controls';
import CloseDialog from '../controls/Dialog/Close';

export default function Code() {
	const {setHeader} = useChrome();
	const [linesOfCode] = useState(['i am line one', 'i am line two', '\ti am line two - b']);
	const [copied, setCopied] = useState(false);
	const {showClassName} = useScrollOverpass();

	useEffect(() => {
		setHeader(false);
	}, [setHeader]);

	function onCopyCode() {
		try {
			navigator.clipboard.writeText(linesOfCode.join('\n'));
		} finally {
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 2500);
		}
	}

	return <div className={'pt-8 pb-32 overflow-x-auto'}>
		<CloseDialog onClick={() => setHeader(true)} />
		{linesOfCode.map((line, index) => 
			<div key={index} className={'flex items-center'}>
				<div className={'ml-2 mr-4 w-8 min-w-[2rem] text-right dark:text-secondary-400/60'}>{''}{index + 1}</div>
				<div className={'whitespace-nowrap'}>
					{Array.from(line).filter(c => c === '\t').map((_, index) => <span key={index}>&emsp;</span>)}
					{line.replace('\t', '')}
				</div>
			</div>
		)}

		<div className={`
			fixed bottom-0 z-10
			w-full px-4 py-4
			flex flex-col items-center gap-4
			border-t border-secondary-900
			${showClassName}`}>
			<Button icon={copied ? TbCheck : TbCopy} onClick={onCopyCode} className={'w-full'} />
		</div>
	</div>;
}