import React, {createContext, useContext, useEffect} from 'react';
import useLocalStorage from 'use-local-storage';

const	AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({children}) => {
	const [darkMode, setDarkMode] = useLocalStorage('darkMode', null);

	useEffect(() => {
		if(darkMode === null) {
			setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	}, [darkMode, setDarkMode]);

	return <AppContext.Provider value={{darkMode, setDarkMode}}>{children}</AppContext.Provider>;
};