import React from 'react';
import ReactSwitch from 'react-switch';
import {useApp} from '../context/useApp';

export default function Switch({checked, onChange}) {
	const {darkMode} = useApp();
	const offColor = darkMode ? '#334155' : '#cbd5e1';
	const onColor = darkMode ? '#da2977' : '#f472b6';

	return <ReactSwitch 
		onChange={onChange} 
		checked={checked} 
		offColor={offColor} onColor={onColor} 
		checkedIcon={false} uncheckedIcon={false} />;
}