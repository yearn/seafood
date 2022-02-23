import React, {useApp} from '../context/useApp';
import MainNavigation from './layout/MainNavigation';

export default function Chrome({children}) {
	const {darkMode} = useApp();
	return <div className={(darkMode ? 'dark ' : '') + 'relative max-w-full min-h-screen'}>
		<div className={'bg'}></div>
		<div className={'absolute z-10 w-full pb-32'}>
			<MainNavigation />
			<div className={'p-8'}>{children}</div>
		</div>
	</div>;
}
