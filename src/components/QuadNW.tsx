/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react';

export default function QuadNW({className}: {className?: string}) {
	return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 512 512">
		<path
			d="
			M 0,512
			a 512,512 0,0,1 512,-512
			L 0,0
			L 0,512
			"/>
	</svg>;
}