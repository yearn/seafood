import {createContext, useContext} from 'react';

export const	SelectedProviderContext = createContext();

export const useSelectedProvider = () => useContext(SelectedProviderContext);