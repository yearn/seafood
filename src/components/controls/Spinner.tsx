import React from 'react';
import {Triangle} from 'react-loader-spinner';
import colors from 'tailwindcss/colors';
import {useChrome} from '../Chrome';

export default function Spinner({width, height}: {width?: string, height?: string}) {
	const {darkMode} = useChrome();
	return <Triangle
		width={width}
		height={height}
		color={darkMode ? colors.pink[400] : colors.pink[400]}
		ariaLabel={'triangle-loading'}
		visible={true} />;
}
