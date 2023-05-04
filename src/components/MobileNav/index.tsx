import React from 'react';
import {RxHamburgerMenu} from 'react-icons/rx';
import {useNavigate} from 'react-router-dom';
import {Button} from '../controls';
import Simulator from '../Simulator';
import {AnimatePresence, motion} from 'framer-motion';
import SimulatorStatus from '../Simulator/SimulatorStatus';
import {useSimulator} from '../../context/useSimulator';
import Menu from './Menu';
import {useChrome} from '../Chrome';

export default function MobileNav({className}: {className: string}) {
	const navigate = useNavigate();
	const {showOverpassClassName} = useChrome();
	const {simulating} = useSimulator();

	return <>
		<Menu action={(location.hash === '#menu') ? 'show' : 'hide'}></Menu>
		<div className={`
			fixed bottom-0 z-10
			w-full px-2 py-2
			flex flex-col items-center justify-end
			border-t border-white dark:border-secondary-900
			${showOverpassClassName}
			${className}`}>

			<AnimatePresence>
				{simulating && <motion.div key={'status'} 
					className={'w-full pb-2 flex justify-end'}
					transition={{ease: 'easeIn', duration: .1}}
					initial={{y: 20, opacity: 0}}
					animate={{y: 0, opacity: 1}}
					exit={{y: 20, opacity: 0}}>
					<div className={'w-full'}>
						<SimulatorStatus />
					</div>
				</motion.div>}
			</AnimatePresence>

			<div className={'w-full py-2 flex items-center gap-2 sm:gap-3'}>
				<Button onClick={() => navigate('#menu')} 
					className={'w-1/5'}
					iconClassName={'text-2xl'}
					icon={RxHamburgerMenu} />
				<Simulator className={'grow'} />
			</div>
		</div>
	</>;
}
