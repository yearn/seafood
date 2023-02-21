import React from 'react';
import ReactSlider from 'react-slider';
import {scoreToBgColor} from '../colors';

export default function Slider({label, details, score}: {label: string, details?: string, score: number}) {
	return <div className={'pt-6 sm:pt-4 pb-2 sm:pb-1 flex flex-col gap-2 sm:gap-1'}>
		<div className={'flex items-center justify-between'}>
			<div>{label}</div>
			<div>{details}</div>
		</div>
		<ReactSlider
			disabled={true}
			min={1} max={5}
			className={'relative w-full h-[20px]'}
			value={score}
			renderThumb={(props, state) => <div {...props} className={`
				w-4 h-4 top-[1px] rounded outline-none
				${scoreToBgColor(state.valueNow)}`}></div>}
			renderTrack={(props) => <div key={props.key} className={`
				absolute top-[8px] w-full h-[2px]
				bg-gradient-to-r from-green-900 via-yellow-500 to-red-600`}></div>}
			minDistance={1} />
	</div>;
}
