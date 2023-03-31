import React, {useState} from 'react';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {Pebble} from '../controls';

export default function CopyButton({clip, className = ''}) {
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

	return <Pebble onClick={copy} className={className}>
		{!copied && <TbCopy className={'stroke-secondary-600 dark:stroke-secondary-300'}></TbCopy>}
		{copied && <TbCheck className={'stroke-secondary-600 dark:stroke-secondary-300'}></TbCheck>}
	</Pebble>;
}