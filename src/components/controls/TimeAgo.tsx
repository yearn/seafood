import React, {Key} from 'react';
import _TimeAgo, {Formatter, Suffix, Unit} from 'react-timeago';

function timeAgoFormatter (value: number, unit: Unit, suffix: Suffix, epochMiliseconds: number, nextFormatter: Formatter) {
	if(unit === 'second') {
		return 'moments ago';
	} else {
		return nextFormatter(value, unit, suffix, epochMiliseconds, nextFormatter);
	}
}

export default function TimeAgo({date}: {date?: Date | number}) {
	const _date = React.useMemo(() => new Date(new Date(date || 0).toUTCString()), [date]);
	if(!date) return <></>;
	return <_TimeAgo key={date as Key} date={new Date(_date)} minPeriod={60} formatter={timeAgoFormatter as Formatter} />;
}
