import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {IconType} from 'react-icons';
import Spinner from './Spinner';

export default function Button({
	icon,
	label, 
	title,
	badge,
	onClick,
	notify,
	ping,
	disabled,
	hot,
	className, 
	iconClassName,
	busy
}: {
	icon?: IconType, 
	label?: string,
	title?: string,
	badge?: string,
	onClick: () => void, 
	notify?: boolean, 
	ping?: boolean,
	disabled?: boolean, 
	hot?: boolean,
	className?: string, 
	iconClassName?: string,
	busy?: boolean
}) {

	return <button onClick={onClick} disabled={disabled} title={title} className={`
		group relative flex items-center justify-center
		h-10 px-4 border

		${hot && !disabled ? 'bg-primary-200 dark:bg-primary-800 hover:border-selected-800 hover:dark:border-selected-300' : ''}
		${hot ? 'border-primary-600 dark:border-primary-400 hover:border-selected-400 dark:hover:border-selected-600'
		: 'bg-transparent sm:bg-primary-500 sm:dark:bg-primary-900/40 border-transparent'}
		sm:hover:bg-selected-400 sm:active:bg-selected-500
		sm:dark:hover:bg-selected-600 sm:dark:active:bg-selected-700

		disabled:text-secondary-400 disabled:dark:text-secondary-500
		sm:disabled:bg-gray-200 sm:disabled:dark:bg-gray-900/80
		sm:disabled:hover:bg-gray-200 sm:disabled:dark:hover:bg-gray-900/80
		disabled:cursor-default

		cursor-pointer

		${icon && label ? 'pl-3' : ''}
		${!label ? 'px-3' : ''}
		${className}`}>

		{!busy && icon && <>
			{'\u00A0'}
			{icon({className: `text-xl
			${disabled 
		? 'text-gray-400 dark:text-gray-600 pointer-events-none' 
		: `text-secondary-900 
			dark:text-primary-400 sm:group-hover:dark:text-black sm:group-active:dark:text-black`}
			${label ? 'mr-2' : ''}
			${iconClassName}`})}
			{'\u00A0'}
		</>}

		{!busy && label}

		{busy && <Spinner 
			width={'1.5rem'}
			height={'1.5rem'} />}

		<AnimatePresence initial={false}>
			{badge && <motion.div
				key={badge}
				transition={{type: 'spring', stiffness: 2000, damping: 32}}
				initial={{y: 6, opacity: 0}}
				animate={{y: 0, opacity: 1}}
				exit={{y: 6, opacity: 0}}
				className={'absolute -top-2 -right-2 flex w-5 h-5'}>
				<div className={`
					relative w-5 h-5 flex items-center justify-center
					bg-primary-300 dark:bg-primary-800
					font-mono text-xs
					shadow`}>{badge}</div>
			</motion.div>}
		</AnimatePresence>


		{notify && <div className={'absolute -top-1 -right-1 flex h-3 w-3'}>
			<div className={`
				relative h-3 w-3 shadow
				${disabled ? 'bg-primary-500' : 'bg-attention-400 dark:bg-attention-500'}`}></div>
		</div>}

		{ping && <div className={'absolute -top-1 -right-1 flex items-center justify-center h-3 w-3'}>
			<div className={`
				absolute h-full w-full 
				bg-selected-400 
				opacity-75 animate-ping`}></div>
			<div className={`
				relative h-2 w-2 
				${disabled ? 'bg-primary-500' : 'bg-selected-500'}`}></div>
		</div>}

	</button>;
}
