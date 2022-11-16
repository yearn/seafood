import React, {useMemo} from 'react';
import ReactTooltip, {TooltipProps} from 'react-tooltip';
import {useChrome} from '../Chrome';

export default function Tooltip(props: TooltipProps) {
	const {darkMode} = useChrome();
	const propOverrides = useMemo<TooltipProps>(() => {
		return {...props, type: darkMode ? 'light': 'dark'};
	}, [props, darkMode]);
	return <ReactTooltip {...propOverrides} />;
}