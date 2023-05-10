import React, {ReactNode} from 'react';
import {ProbesContext} from './useProbes';
import useApyProbe from './useApyProbe';
import useHarvestProbe from './useHarvestProbe';
import useAssetsProbe from './useAssetsProbe';

export default function ProbesProvider({children}: {children: ReactNode}) {
	const harvest = useHarvestProbe();
	const apy = useApyProbe();
	const assets = useAssetsProbe();
	return <ProbesContext.Provider value={{probes: [
		harvest, apy, assets
	]}}>
		{children}
	</ProbesContext.Provider>;
}

// 🛸
