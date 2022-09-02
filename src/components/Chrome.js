import React, {createContext, useContext, useState} from 'react';
import {useApp} from '../context/useApp';
import Header from './Header';

const	ChromeContext = createContext();
export const useChrome = () => useContext(ChromeContext);
export default function Chrome({children}) {
	const {darkMode} = useApp();
	const [header, setHeader] = useState(true);

	return <ChromeContext.Provider value={{header, setHeader}}>
		<div className={(darkMode ? 'dark' : '') + ' max-w-full'}>
			<div className={'text-secondary-900 dark:text-secondary-200'}>
				<div className={`
				fixed top-0 z-0 w-full h-full
				bg-gradient-to-br from-secondary-50 via-secondary-50 to-secondary-100
				sm:bg-gradient-radial-to-br sm:from-secondary-50 sm:via-secondary-50 sm:to-secondary-100
				dark:bg-gradient-to-br dark:from-indigo-900 dark:to-black
				dark:sm:bg-gradient-radial-to-br dark:sm:from-indigo-900 dark:sm:via-secondary-900 dark:sm:to-black`} />
				<div className={'absolute z-10 w-full min-h-full flex flex-col'}>
					{header && <Header></Header>}
					{children}
				</div>
			</div>
		</div>
	</ChromeContext.Provider>;
}
