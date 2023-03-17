import React, {ReactNode} from 'react';
import useApyProbe from './useApyProbe';
import useHarvestProbe from './useHarvestProbe';
import {ProbesContext} from './useProbes';

export default function ProbesProvider({children}: {children: ReactNode}) {
	const harvest = useHarvestProbe();
	const apy = useApyProbe();
	return <ProbesContext.Provider value={{probes: [harvest, apy]}}>
		{children}
	</ProbesContext.Provider>;
}

// 🛸
