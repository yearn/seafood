import React, {useApp} from '../context/useApp';
import MainNavigation from './layout/MainNavigation';

export default function Chrome({children}) {
	const {darkMode} = useApp();
	return <div className={(darkMode ? 'dark' : '')}>
		<div className={'bg'}></div>
		<div className={'absolute z-10 w-screen pb-32'}>
			<MainNavigation />
			<div className={'p-4'}>{children}</div>
		</div>
	</div>;
}
