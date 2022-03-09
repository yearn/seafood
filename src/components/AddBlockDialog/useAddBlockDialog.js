import React, {createContext, useContext, useState} from 'react';

export const AddBlockContext = createContext();

export const useAddBlockDialog = () => useContext(AddBlockContext);

export function AddBlockDialogProvider({children}) {
	const [step, setStep] = useState(0);
	const [result, setResult] = useState(defaultResult());
	return <AddBlockContext.Provider value={{
		step, setStep, result, setResult
	}}>{children}</AddBlockContext.Provider>;
}

export function defaultResult() {
	return {
		vault: null,
		strategy: null,
		func: null
	};
}