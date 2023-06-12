import React from 'react';
import {BsBrightnessHigh, BsMoonFill} from 'react-icons/bs';
import {useChrome} from './Chrome';

export default function Lux({className}) {
	const {darkMode, setDarkMode} = useChrome();

	return <div onClick={() => {setDarkMode(!darkMode);}} 
		className={`
			flex items-center justify-center
			sm:hover:text-selected-400 sm:active:text-selected-500
			sm:dark:hover:text-selected-600 sm:dark:active:text-selected-700
			cursor-pointer
			${className}`}>
		{darkMode ? <BsMoonFill /> : <BsBrightnessHigh />}
	</div>;
}