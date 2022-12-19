import React from 'react';
import useScrollOverpass from '../../context/useScrollOverpass';
import Tools from './Tools';
import {BiggerThanSmallScreen} from '../../utils/breakpoints';
import QuadNW from '../QuadNW';

export default function Header() {
	const {overpassClassName} = useScrollOverpass();

	return <div className={`
		sticky top-0 z-10 pb-4 sm:py-2
		sm:flex sm:justify-end sm:items-center
		${overpassClassName}`}>
		<BiggerThanSmallScreen>
			<div className={'relative w-1/2 pr-12 pl-8 flex flex-col'}>
				<Tools />
			</div>
			<QuadNW className={`
					absolute -bottom-2 left-0 w-2 h-2 
					${overpassClassName ? 'fill-primary-800 dark:fill-black/60' : 'fill-transparent'}`} />
		</BiggerThanSmallScreen>
	</div>;
}