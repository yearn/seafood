import React, {ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import Dialog, {DialogContext} from './Dialog';
import CheckForUpdates from './CheckForUpdates';
import Powerstrip from './Powerstrip';
import MobileNav from './MobileNav';
import Powertools from './Powertools';

interface ChromeContext {
	darkMode: boolean,
	setDarkMode: (darkMode: boolean) => void,
	dialog: DialogContext | undefined,
	setDialog: React.Dispatch<React.SetStateAction<DialogContext | undefined>>,
	showOverpassClassName: string,
	hideOverpassClassName: string,
	overpassClassName: string,
	scrollToTop: () => void
}

const overpass = {
	showClassName: 'bg-secondary-100/60 dark:bg-black/60 backdrop-blur-md shadow',
	hideClassName: 'bg-secondary-100/60 dark:bg-black/60 backdrop-blur-md'
};

const	chromeContext = createContext({} as ChromeContext);

export const useChrome = () => useContext(chromeContext);

export default function ChromeProvider({children}: {children: ReactNode}) {
	const [dialog, setDialog] = useState<DialogContext | undefined>();
	const [darkMode, setDarkMode] = useLocalStorage('darkMode', null);
	const [overpassClassName, setOverpassClassName] = useState(overpass.hideClassName);
	const scrollContainer = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if(darkMode === null) {
			setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	}, [darkMode, setDarkMode]);

	useEffect(() => {
		if(!scrollContainer.current) return;
		const element = scrollContainer.current;

		function updatePosition() {
			if(!scrollContainer.current) return;
			setOverpassClassName(element.scrollTop > 0 ? overpass.showClassName : overpass.hideClassName);
		}

		element.addEventListener('scroll', updatePosition);

		return () => {
			element.removeEventListener('scroll', updatePosition);
		};
	}, [scrollContainer, setOverpassClassName]);

	const scrollToTop = useCallback(() => {
		if(scrollContainer.current) scrollContainer.current.scrollTo({top: 0});
	}, [scrollContainer]);

	return <chromeContext.Provider value={{
		darkMode, setDarkMode,
		dialog, setDialog,
		showOverpassClassName: overpass.showClassName,
		hideOverpassClassName: overpass.hideClassName,
		overpassClassName: overpassClassName,
		scrollToTop
	}}>
		<div className={(darkMode ? 'dark' : '') + ' max-w-full'}>
			<div className={`
				fixed z-0 top-0 w-full h-full
				bg-gradient-to-br from-secondary-50 via-secondary-50 to-secondary-100
				sm:bg-gradient-radial-to-br sm:from-secondary-100 sm:via-secondary-50 sm:to-secondary-50
				dark:bg-gradient-to-t dark:from-indigo-950 dark:to-black
				dark:sm:bg-gradient-radial-to-tl dark:sm:from-indigo-950 dark:sm:via-secondary-950 dark:sm:to-black`} />
			<div ref={scrollContainer} className={`
				absolute z-10 w-full h-screen
				pl-0 sm:pl-6 flex sm:flex-col items-start
				text-secondary-900 dark:text-secondary-200
				overflow-x-hidden overflow-y-auto override-scroll`}>
				<MobileNav className={'flex sm:hidden'} />
				<Powerstrip className={'hidden sm:block fixed z-[100] top-0 left-0 w-6 h-full'} />
				<Powertools className={'hidden sm:block sticky top-0 z-10 w-full'} />
				<CheckForUpdates />
				{children}
			</div>
			{dialog && <Dialog 
				Component={dialog.Component}
				args={dialog.args}
				className={'text-secondary-900 dark:text-secondary-200'} />}
		</div>
	</chromeContext.Provider>;
}
