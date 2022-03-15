import {createContext, useContext} from 'react';

export const	BlocksContext = createContext();

export const useBlocks = () => useContext(BlocksContext);