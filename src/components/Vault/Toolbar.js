import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import useScrollOverpass from '../../context/useScrollOverpass';
import {useSimulator} from '../../context/useSimulator';
import SimulatorStatus from './SimulatorStatus';
import Tools from './Tools';

export default function Toolbar() {
	const {showClassName} = useScrollOverpass();
	const {simulating} = useSimulator();

	return <div className={`
		fixed bottom-0 z-10
		w-full px-4 py-4
		flex flex-col items-center justify-end gap-4
		border-t border-white dark:border-secondary-900
		${showClassName}`}>

		<AnimatePresence>
			{simulating && <motion.div key={'status'} 
				className={'w-full flex justify-end'}
				transition={{ease: 'easeIn', duration: .1}}
				initial={{y: 20}}
				animate={{y: 0}}
				exit={{y: 20}}>
				<div className={'w-full'}>
					<SimulatorStatus />
				</div>
			</motion.div>}
		</AnimatePresence>

		<Tools />
	</div>;
}
