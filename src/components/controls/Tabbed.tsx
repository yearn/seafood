import React, {useEffect, useState} from 'react';

interface TabProps {
	label: string
	content: React.ReactNode
	onClick?: () => void,
	className?: string
}

const Tab: React.FC<TabProps> = ({label, onClick, className}) =>
	<button type={'button'} onClick={onClick} className={className}>{label}</button>;

interface TabbedProps {
	tabs: TabProps[]
	className?: string
	tabClassName?: string
	activeTabClassName?: string,
	contentClassName?: string,
	storageKey?: string
}

const Tabbed: React.FC<TabbedProps> = ({tabs, className, tabClassName, activeTabClassName, contentClassName, storageKey}) => {
	const [activeTabIndex, setActiveTabIndex] = useState(() => {
		if(!storageKey) return 0;
		const stored = localStorage.getItem(storageKey);
		if(!stored) return 0;
		return parseInt(stored, 10) || 0;
	});

	useEffect(() => {
		if(!storageKey) return;
		localStorage.setItem(storageKey, activeTabIndex.toString());
	}, [storageKey, activeTabIndex]);

	return <div>
		<div className={className}>
			{tabs.map(({label}, index) => <Tab
				key={label}
				label={label}
				content={null}
				onClick={() => setActiveTabIndex(index)}
				className={index === activeTabIndex ? activeTabClassName : tabClassName}
			/>)}
		</div>
		<div className={contentClassName}>{tabs.length && tabs[activeTabIndex].content}</div>
	</div>;
};

export default Tabbed;
