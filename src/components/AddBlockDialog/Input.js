import React from 'react';
import {BsAsterisk, BsCheckLg} from 'react-icons/bs';
import {Input as InputBase} from '../controls';

export default function Input({defaultValue, placeholder, onChange, valid}) {
	return <div className={'relative w-full flex items-center'}>
		<InputBase type={'text'} 
			defaultValue={defaultValue}
			placeholder={placeholder}
			onChange={onChange}
			className={`
			w-full py-2 px-2 text-lg border-transparent leading-tight
			bg-gray-300
			text-primary-900
			focus:border-primary-400 focus:bg-gray-200 focus:ring-0
			dark:bg-gray-800
			dark:text-white
			focus:dark:border-selected-600 focus:ring-0
			rounded-md shadow-inner`} />
		<div className={'absolute z-10 ml-4 -right-7'}>
			{valid && <BsCheckLg className={'fill-ok-400'}></BsCheckLg>}
			{!valid && <BsAsterisk className={'fill-error-600'}></BsAsterisk>}
		</div>
	</div>;
}