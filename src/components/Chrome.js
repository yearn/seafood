import React, {createContext, useContext, useEffect, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
import useLocalStorage from '../utils/useLocalStorage';
import Dialog from './Dialog';
import Header from './Header';
import CheckForUpdates from './CheckForUpdates';

const	ChromeContext = createContext();
export const useChrome = () => useContext(ChromeContext);
export default function Chrome({children}) {
	const [darkMode, setDarkMode] = useLocalStorage('darkMode', null);
	const [dialog, setDialog] = useState();

	useEffect(() => {
		if(darkMode === null) {
			setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	}, [darkMode, setDarkMode]);

	return <ChromeContext.Provider value={{
		darkMode, setDarkMode,
		dialog, setDialog
	}}>
		<div className={(darkMode ? 'dark' : '') + ' max-w-full'}>
			<div className={'text-secondary-900 dark:text-secondary-200'}>
				<div className={`
				fixed z-0 top-0 w-full h-full
				bg-white dark:bg-black`} />
				<div className={`
					absolute z-10 w-full min-h-full pl-4 flex flex-col`}>
					<Header />
					<CheckForUpdates />
					{children}
				</div>
				<AnimatePresence>
					{dialog && <Dialog Component={dialog.component} args={dialog.args} />}
				</AnimatePresence>
			</div>
		</div>
	</ChromeContext.Provider>;
}
