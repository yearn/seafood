import React from 'react';
import Icon from './Icon';

export default function SpeechBubble({text, large, className}: {text: string, large?: boolean, className?: string}) {
	return <div className={`flex items-center ${large ? 'gap-2' : ''} ${className}`}>
		<Icon className={`py-1 ${large ? 'h-20' : 'h-12'}`} />
		<div className={`rainbow-text font-bold whitespace-nowrap ${large ? 'text-2xl' : ''}`}>{`.｡oO ${text}`}&nbsp;</div>
	</div>;
}
