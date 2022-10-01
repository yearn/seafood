import React, {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import {BsX} from 'react-icons/bs';
import {motion} from 'framer-motion';

export default function Dialog({Component, args}) {
	const navigate = useNavigate();
	const close = useCallback(() => navigate(-1), [navigate]);
	useKeypress(['Escape'], close);

	return <div className={`
		fixed z-20 inset-0 flex items-center justify-center backdrop-blur`}>
		<div onClick={close} className={'absolute inset-0 z-1'} />
		<motion.div className={`
		absolute z-10 inset-0 sm:inset-8 p-0 bg-secondary-50 dark:bg-secondary-900 
		sm:shadow-md sm:rounded-lg`}
		transition={{ease: 'easeInOut', duration: .05}}
		initial={{opacity: .5, scale: .95}}
		animate={{opacity: 1, scale: 1}}
		exit={{opacity: 0, scale: .95}}>
			<Component {...args} />
		</motion.div>
		<div onClick={close} className={`
			absolute z-20 top-4 right-4 sm:top-12 sm:right-12 text-4xl cursor-pointer`}>
			<BsX />
		</div>
	</div>;
}