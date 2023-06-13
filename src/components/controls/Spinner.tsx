import React from 'react';
import {ProgressBar} from 'react-loader-spinner';
import colors from 'tailwindcss/colors';
import {useChrome} from '../Chrome';

export default function Spinner({width, height}: {width?: string, height?: string}) {
	const {darkMode} = useChrome();
	return <ProgressBar
		width={width}
		height={height}
		barColor={darkMode ? colors.pink[400] : colors.pink[400]}
		borderColor={darkMode ? colors.sky[900] : colors.sky[200]} />;
}
