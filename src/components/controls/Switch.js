import React, {useMemo} from 'react';
import ReactSwitch from 'react-switch';
import {useChrome} from '../Chrome';
import colors from 'tailwindcss/colors';

export default function Switch({checked, onChange, checkedIcon, uncheckedIcon}) {
	const {darkMode} = useChrome();
	// const offColor = darkMode ? '#334155' : '#cbd5e1';
	// const onColor = darkMode ? '#da2977' : '#f472b6';

	const offColor = useMemo(() => {
		return darkMode ? colors.slate[700] : colors.slate[300];
	}, [darkMode]);

	const onColor = useMemo(() => {
		return darkMode ? colors.pink[500] : colors.pink[400];
	}, [darkMode]);

	return <ReactSwitch
		onChange={onChange}
		checked={checked}
		offColor={offColor} onColor={onColor}
		checkedIcon={checkedIcon || false} uncheckedIcon={uncheckedIcon || false} />;
}