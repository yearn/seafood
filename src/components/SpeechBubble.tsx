import React from 'react';
import Icon from './Icon';

export default function SpeechBubble({text, className}: {text: string, className?: string}) {
	return <div className={`flex items-center ${className}`}>
		<Icon className={'py-1 w-12 h-12'} />
		<div className={'rainbow-text font-bold drop-shadow whitespace-nowrap'}>{`.｡oO ${text}`}&nbsp;</div>
	</div>;
}
