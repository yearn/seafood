// write me react UI components that create a bare minimum tabbed UI structure
// - use TypeScript
// - do not include any styling
// - clicking tabs should show and hide different content
// - only responsd with code, no conversation

import React, {useState} from 'react';

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
	contentClassName?: string
}

const Tabbed: React.FC<TabbedProps> = ({tabs, className, tabClassName, activeTabClassName, contentClassName}) => {
	const [activeTabIndex, setActiveTabIndex] = useState(0);
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
