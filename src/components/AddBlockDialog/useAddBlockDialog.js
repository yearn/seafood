import React, {createContext, useContext, useState} from 'react';

export const AddBlockContext = createContext();

export const useAddBlockDialog = () => useContext(AddBlockContext);

export function AddBlockDialogProvider({children}) {
	const [steps, setSteps] = useState([stepEnum.selectVault]);
	const [result, setResult] = useState(defaultResult());
	return <AddBlockContext.Provider value={{
		steps, setSteps, result, setResult
	}}>{children}</AddBlockContext.Provider>;
}

export const stepEnum = {
	selectVault: {},
	selectVaultFunctionOrStrategy: {},
	selectStrategyFunction: {},
	setInputs: {}
};

export function defaultResult() {
	return {
		vault: null,
		strategy: null,
		function: null,
		inputs: null
	};
}