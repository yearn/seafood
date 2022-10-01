import React, {createContext, useContext, useEffect, useState} from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import Dialog from './Dialog';
import Header from './Header';

const	ChromeContext = createContext();
export const useChrome = () => useContext(ChromeContext);
export default function Chrome({startWithHeader = true, children}) {
	const [darkMode, setDarkMode] = useLocalStorage('darkMode', null);
	const [header, setHeader] = useState(startWithHeader);
	const [dialog, setDialog] = useState();

	useEffect(() => {
		if(darkMode === null) {
			setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	}, [darkMode, setDarkMode]);

	return <ChromeContext.Provider value={{
		darkMode, setDarkMode,
		header, setHeader,
		dialog, setDialog
	}}>
		<div className={(darkMode ? 'dark' : '') + ' max-w-full'}>
			<div className={'text-secondary-900 dark:text-secondary-200'}>
				<div className={`
				fixed top-0 z-0 w-full h-full
				bg-gradient-to-br from-secondary-50 via-secondary-50 to-secondary-100
				sm:bg-gradient-radial-to-br sm:from-secondary-50 sm:via-secondary-50 sm:to-secondary-100
				dark:bg-gradient-to-br dark:from-indigo-900 dark:to-black
				dark:sm:bg-gradient-radial-to-br dark:sm:from-indigo-900 dark:sm:via-secondary-900 dark:sm:to-black`} />
				<div className={`
					absolute z-10 w-full min-h-full flex flex-col`}>
					{header && <Header></Header>}
					{children}
				</div>
				{dialog && <Dialog Component={dialog.component} args={dialog.args} />}
			</div>
		</div>
	</ChromeContext.Provider>;
}
