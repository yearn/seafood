import React, {ReactNode, createContext, useContext, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {useChrome} from './Chrome';
import Simulator from './Simulator';
import SimulatorStatus from './Simulator/SimulatorStatus';

interface PowertoolsContext {
	enable: boolean,
	setEnable: (enable: boolean) => void,
	showSimulator: boolean,
	setShowSimulator: (show: boolean) => void,
	leftPanelKey: string,
	setLeftPanelKey: (key: string) => void,
	leftPanel: ReactNode | undefined,
	setLeftPanel: (Component: ReactNode | undefined) => void,
	bottomPanel: ReactNode | undefined,
	setBottomPanel: (Component: ReactNode | undefined) => void
}

const	powertoolsContext = createContext({} as PowertoolsContext);
export const usePowertools = () => useContext(powertoolsContext);
export function PowertoolsProvider({children}: {children: ReactNode}) {
	const [enable, setEnable] = useState(true);
	const [showSimulator, setShowSimulator] = useState(true);
	const [leftPanelKey, setLeftPanelKey] = useState<string>('');
	const [leftPanel, setLeftPanel] = useState<ReactNode | undefined>();
	const [bottomPanel, setBottomPanel] = useState<ReactNode | undefined>();

	return <powertoolsContext.Provider value={{
		enable, setEnable,
		showSimulator, setShowSimulator,
		leftPanelKey, setLeftPanelKey,
		leftPanel, setLeftPanel,
		bottomPanel, 
		setBottomPanel}}>
		{children}
	</powertoolsContext.Provider>;
}

export default function Powertools({className}: {className: string}) {
	const {
		enable, 
		showSimulator,
		leftPanelKey,
		leftPanel,
		bottomPanel
	} = usePowertools();
	const {overpassClassName} = useChrome();
	return <div className={`
		${overpassClassName}
		${className}
		${enable ? '' : 'sm:opacity-0 sm:pointer-events-none'}`}>
		<div className={'flex flex-col'}>
			<div className={'h-20 px-8 flex items-center gap-3'}>
				<div className={`relative h-full ${showSimulator ? 'w-[50%]' : 'w-full'}`}>
					<AnimatePresence initial={false}>
						{leftPanel && <motion.div
							key={leftPanelKey}
							transition={{type: 'spring', stiffness: 2000, damping: 32}}
							initial={{y: 4, opacity: 0}}
							animate={{y: 0, opacity: 1}}
							exit={{y: 4, opacity: 0}}
							className={'absolute inset-0 flex items-center'}>
							{leftPanel}
						</motion.div>}
					</AnimatePresence>
				</div>				
				{showSimulator && <div className={'flex w-1/2 relative gap-3'}>
					<Simulator />
					<SimulatorStatus />
				</div>}
			</div>
			{bottomPanel && <div className={' py-2'}>
				{bottomPanel}
			</div>}
		</div>
	</div>;
}
