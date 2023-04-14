import React, {useCallback, useMemo} from 'react';
import ReactSlider from 'react-slider';
import {humanizeRiskCategory} from '../../../utils/utils';
import {scoreToBgColor} from '../colors';
import FilterChip from './Chip';
import {useFilter, ScoresFilter} from './Provider';

export default function Scores() {
	const {scores, setScores} = useFilter();

	const label = useMemo(() => {
		const result = [] as string[];
		for(const key of Object.keys(scores)) {
			const range = scores[key as keyof ScoresFilter];
			if(range.min === 1 && range.max === 5) continue;
			if(range.min === 1) {
				result.push(`${humanizeRiskCategory(key)} < ${range.max + 1}`);
			} else if(range.max === 5) {
				result.push(`${humanizeRiskCategory(key)} > ${range.min - 1}`);
			} else {
				result.push(`${humanizeRiskCategory(key)} ${range.min}-${range.max}`);
			}
		}
		if(result.length === 0) return 'All risk scores';
		return result.join(', ');
	}, [scores]);

	const onChange = useCallback((key: string) => {
		return (value: number[]) => {
			setScores(current => ({...current, [key]: {min: value[0], max: value[1]}}));
		};
	}, [setScores]);

	const reset = useCallback((key: string) => {
		return () => {
			setScores(current => ({...current, [key]: {min: 1, max: 5}}));
		};
	}, [setScores]);

	return <FilterChip hash={'scores'} label={label}>
		<div className={'w-full h-full flex flex-col'}>
			<div className={'sm:hidden pl-6 pt-5 font-bold text-lg'}>{'Risk score filters'}</div>
			<div className={'grow flex flex-col gap-6 items-center justify-center sm:grid-flow-col sm:grid-rows-4 sm:gap-3'}>
				{Object.keys(scores).map(key => <div key={key} className={`
					w-[80%] sm:w-48 flex flex-col items-start justify-start`}>
					<ReactSlider
						min={1} max={5}
						onChange={onChange(key)}
						className={'relative w-full h-[20px]'}
						value={[scores[key as keyof ScoresFilter].min, scores[key as keyof ScoresFilter].max]}
						ariaLabel={['Lower thumb', 'Upper thumb']}
						ariaValuetext={state => `Thumb value ${state.valueNow}`}
						renderThumb={(props, state) => <div {...props} className={`
							w-4 h-4 top-[1px] cursor-pointer outline-none
							${scoreToBgColor(state.valueNow)}`}></div>}
						renderTrack={(props) => <div key={props.key} className={`
							absolute top-[8px] w-full h-[2px] cursor-pointer
							bg-gradient-to-r from-green-900 via-yellow-500 to-red-600`}></div>}
						minDistance={1} />
					<div onClick={reset(key)} className={'text-lg sm:text-xs capitalize cursor-pointer'}>{humanizeRiskCategory(key)}</div>
				</div>)}
			</div>
		</div>
	</FilterChip>;
}
