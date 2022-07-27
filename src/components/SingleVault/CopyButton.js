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

	return <button onClick={copy} className={'sm-tb-icon-button'}>
		{!copied && <TbCopy></TbCopy>}
		{copied && <TbCheck></TbCheck>}
	</button>;
}