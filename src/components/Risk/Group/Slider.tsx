import React from 'react';
import ReactSlider from 'react-slider';
import {FloatingFocusManager} from '@floating-ui/react';
import {useMediumBreakpoint} from '../../../utils/breakpoints';
import {humanizeRiskCategory} from '../../../utils/utils';
import {scoreToBgColor} from '../colors';
import Score, {useFloatie} from '../Score';

export default function Slider({
	group, 
	category, 
	score, 
	details
}: {
	group: string, 
	category: string, 
	score: number, 
	details?: string
}) {
	const mediumBreakpoint = useMediumBreakpoint();
	const floatie = useFloatie(group, category, score, 'right');

	return <div ref={floatie.refs.setReference} 
		{...floatie.getReferenceProps()} 
		onClick={floatie.openModal}
		className={`border border-transparent
		px-2 sm:px-6 py-3 sm:py-2 flex flex-col gap-2 sm:gap-1
		hover:border-selected-300 dark:hover:border-selected-800`}>
		<div className={'flex items-center justify-between'}>
			<div>{humanizeRiskCategory(category)}</div>
			<div>{details}</div>
		</div>

		<ReactSlider
			disabled={true}
			min={1} max={5}
			className={'relative w-full h-[20px]'}
			value={score}
			renderThumb={(props, state) => <div {...props} className={`
				w-4 h-4 top-[1px] outline-none
				${scoreToBgColor(state.valueNow)}`}></div>}
			renderTrack={(props) => <div key={props.key} className={`
				absolute top-[8px] w-full h-[2px]
				bg-gradient-to-r from-green-900 via-yellow-500 to-red-600`}></div>}
			minDistance={1} />

		{floatie.open && mediumBreakpoint && <FloatingFocusManager context={floatie.context} modal={false}>
			<div ref={floatie.refs.setFloating} {...floatie.getFloatingProps()} className={`
				z-[100] p-4
				bg-secondary-100 dark:bg-black
				border border-selected-200 dark:border-selected-900
				shadow-lg shadow-secondary-900/10 dark:shadow-black/80
				outline-none shadow-md
				${category === 'median' ? 'w-64' : 'w-96'}`}
			style={floatie.style}>
				<Score group={group} category={category} score={score} />
			</div>
		</FloatingFocusManager>}
	</div>;
}
