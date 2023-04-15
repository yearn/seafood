import React, {createContext, useContext, useEffect, useState} from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import Dialog from './Dialog';
import CheckForUpdates from './CheckForUpdates';
import Powerstrip from './Powerstrip';
import MobileNav from './MobileNav';

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
			<div className={`
				fixed z-0 top-0 w-full h-full
				bg-gradient-to-br from-secondary-50 via-secondary-50 to-secondary-100
				sm:bg-gradient-radial-to-br sm:from-secondary-100 sm:via-secondary-50 sm:to-secondary-50
				dark:bg-gradient-to-t dark:from-indigo-950 dark:to-black
				dark:bg-gradient-radial-to-tl dark:from-indigo-950 dark:via-secondary-950 dark:to-black`} />
			<div className={`
				absolute z-10 w-full min-h-full
				pl-0 sm:pl-6 flex items-start
				text-secondary-900 dark:text-secondary-200`}>
				<MobileNav className={'flex sm:hidden'} />
				<Powerstrip className={'hidden sm:block fixed z-[100] top-0 left-0 w-6 h-full'} />
				<CheckForUpdates />
				{children}
			</div>
			{dialog && <Dialog 
				Component={dialog.component} 
				args={dialog.args}
				className={'text-secondary-900 dark:text-secondary-200'} />}
		</div>
	</ChromeContext.Provider>;
}
