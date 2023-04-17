import React from 'react';
import {Vault} from '../../context/useVaults/types';

export default function Name({vault, className}: {vault: Vault, className?: string}) {
	return <h1 className={`font-bold text-4xl sm:truncate ${className}`} title={vault.name}>
		{vault.name}
	</h1>;
}
