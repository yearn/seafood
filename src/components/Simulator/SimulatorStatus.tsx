import React, {useMemo} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {useSimulator} from '../../context/useSimulator';
import {useSimulatorStatus} from '../../context/useSimulator/SimulatorStatusProvider';
import {A} from '../controls';
import Tenderly from '../Vault/Tenderly';

export default function SimulatorStatus({className}: {className?: string}) {
	const {simulating} = useSimulator();
	const {status, tenderlyUrl, error} = useSimulatorStatus();

	const effects = useMemo(() => {
		if(error) {
			return `
			bg-error-300 dark:bg-error-700
			border-error-600/40 dark:border-error-400/80
			text-secondary-900 dark:text-secondary-950
			`;
		} else if(simulating) {
			return `
			bg-primary-300 dark:bg-primary-700
			border-primary-600/40 dark:border-primary-400/80
			text-secondary-900 dark:text-primary-950
			`;
		} else {
			return `
			bg-secondary-100 dark:bg-gray-900/80
			border-secondary-600/20 dark:border-secondary-500/20
			text-secondary-300 dark:text-secondary-700
			`;
		}
	}, [simulating, status, error]);

	return <div className={`relative
		grow px-4 h-10 flex items-center border
		transition duration-500
		${effects} ${className}`}>
		<AnimatePresence initial={false}>
			<motion.div 
				key={status}
				className={`absolute w-full font-mono break-words truncate ${error ? 'pr-16' : 'pr-8'}`}
				transition={{type: 'spring', stiffness: 800, damping: 32}}
				initial={simulating ? {y: 10} : false}
				animate={{y: 0}}
				exit={{y: -10, opacity: 0}}>
				{tenderlyUrl && <div className={'absolute right-6 bg-error-600/40 dark:bg-error-400/80'}>
					<Tenderly url={tenderlyUrl} className={'text-primary-600 dark:text-primary-400'} />
				</div>}
				{status}
			</motion.div>
		</AnimatePresence>
	</div>;
}
