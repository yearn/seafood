import React from 'react';
import {Oval} from 'react-loader-spinner';
import colors from 'tailwindcss/colors';
import {useChrome} from '../Chrome';

export default function Spinner({width, height}: {width?: string, height?: string}) {
	const {darkMode} = useChrome();
	return <Oval 
		width={width}
		height={height}
		color={darkMode ? colors.pink[400] : colors.pink[100]}
		secondaryColor={colors.sky[900]} />;
}