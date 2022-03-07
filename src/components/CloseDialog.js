import React from 'react';
import {BsX} from 'react-icons/bs';
import {useNavigate} from 'react-router-dom';

export default function CloseDialog() {
	const navigate = useNavigate();
	return <div onClick={() => navigate(-1)} className={'absolute z-[100] top-4 right-4 md-circle-icon-button'}>
		<BsX />
	</div>;
}