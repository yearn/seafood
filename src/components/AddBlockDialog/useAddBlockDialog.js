import {createContext, useContext} from 'react';

export const AddBlockContext = createContext();

export const useAddBlockDialog = () => useContext(AddBlockContext);

export const stepEnum = {
	selectVault: {},
	selectVaultFunctionOrStrategy: {},
	selectStrategyFunction: {},
	setInputs: {},
	manual: {}
};

export function defaultResult() {
	return {
		vault: null,
		strategy: null,
		function: null,
		inputs: null,
		valid: false
	};
}