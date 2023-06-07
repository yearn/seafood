import React, {ReactNode} from 'react';
import {ProbesContext} from './useProbes';
import useApyProbe from './useApyProbe';
import useHarvestProbe from './useHarvestProbe';
import useAssetsProbe from './useAssetsProbe';

export default function ProbesProvider({children}: {children: ReactNode}) {
	const harvest = useHarvestProbe();
	const assets = useAssetsProbe();
	const apy = useApyProbe();
	return <ProbesContext.Provider value={{probes: [
		harvest, assets, apy
	]}}>
		{children}
	</ProbesContext.Provider>;
}

// 🛸
