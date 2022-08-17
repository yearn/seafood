import React, {useState} from 'react';
import {TbCopy, TbCheck} from 'react-icons/tb';

export default function CopyButton({clip}) {
	const [copied, setCopied] = useState(false);

	function copy() {
		try {
			navigator.clipboard.writeText(clip);
		} finally {
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 2500);
		}
	}

	return <button onClick={copy} className={`
		w-[26px] h-[26px] p-0
		flex items-center justify-center 
		bg-transparent
		hover:bg-selected-400 hover:dark:bg-selected-600
		active:transform active:scale-95
		rounded-full cursor-pointer
		transition duration-200`}>
		{!copied && <TbCopy className={'stroke-secondary-600 dark:stroke-secondary-300'}></TbCopy>}
		{copied && <TbCheck className={'stroke-secondary-600 dark:stroke-secondary-300'}></TbCheck>}
	</button>;
}