import React from 'react';
import {BsX} from 'react-icons/bs';
import {useNavigate} from 'react-router-dom';

export default function Close({onClick}) {
	const navigate = useNavigate();
	return <div onClick={() => {
		if(onClick) onClick();
		navigate(-1);
	}} className={`
		fixed z-[100] top-2 right-2
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