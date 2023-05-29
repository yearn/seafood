import React from 'react';
import {BsBrightnessHigh, BsMoonFill} from 'react-icons/bs';
import {useChrome} from './Chrome';

export default function Lux({className}) {
	const {darkMode, setDarkMode} = useChrome();

	return <div onClick={() => {setDarkMode(!darkMode);}} 
		className={`
			flex items-center justify-center
			cursor-pointer
			${className}`}>
		{darkMode ? <BsMoonFill /> : <BsBrightnessHigh />}
	</div>;
}