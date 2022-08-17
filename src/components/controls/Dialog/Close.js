import React from 'react';
import {BsX} from 'react-icons/bs';
import {useNavigate} from 'react-router-dom';

export default function Close() {
	const navigate = useNavigate();
	return <div onClick={() => navigate(-1)} className={`
		absolute z-[100] top-1 right-4
		sm:top-4 sm:right-4

		w-12 h-12 text-4xl
		flex items-center justify-center
		hover:bg-selected-200 
		dark:hover:bg-selected-600 
		active:scale-90

		rounded-full cursor-pointer
		transition duration-200`}>
		<BsX />
	</div>;
}