import React, {useMemo} from 'react';
import ReactSwitch from 'react-switch';
import {useChrome} from '../Chrome';
import colors from 'tailwindcss/colors';

export default function Switch({checked, onChange, checkedIcon, uncheckedIcon}) {
	const {darkMode} = useChrome();

	const offColor = useMemo(() => {
		return darkMode ? colors.slate[700] : colors.slate[300];
	}, [darkMode]);

	const onColor = useMemo(() => {
		return darkMode ? colors.sky[500] : colors.sky[200];
	}, [darkMode]);

	return <ReactSwitch
		borderRadius={0}
		onChange={onChange}
		checked={checked}
		offColor={offColor} onColor={onColor}
		checkedIcon={checkedIcon || false} uncheckedIcon={uncheckedIcon || false} />;
}