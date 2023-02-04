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

	return <FilterChip label={label} className={`
		grid grid-rows-4 grid-flow-col gap-6`}>
		{Object.keys(scores).map(key => <div key={key} className={`
			w-48 flex flex-col items-start justify-start`}>
			<ReactSlider
				min={1} max={5}
				onChange={onChange(key)}
				className={'relative w-full h-[20px]'}
				trackClassName={'top-[8px] h-[2px] bg-secondary-800 cursor-pointer'}
				thumbClassName={'w-4 h-4 top-[1px] rounded shadow cursor-pointer'}
				value={[scores[key as keyof ScoresFilter].min, scores[key as keyof ScoresFilter].max]}
				ariaLabel={['Lower thumb', 'Upper thumb']}
				ariaValuetext={state => `Thumb value ${state.valueNow}`}
				renderThumb={(props, state) => <div   {...props} className={`
					w-4 h-4 top-[1px] rounded shadow cursor-pointer
					${scoreToBgColor(state.valueNow)}`}></div>}
				minDistance={1} />
			<div onClick={reset(key)} className={'text-xs cursor-pointer'}>{humanizeRiskCategory(key)}</div>
		</div>)}
	</FilterChip>;
}
