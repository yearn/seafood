import React, {useState, useEffect, useCallback} from 'react';
import {useLocation} from 'react-router-dom';
import {useChrome} from '../Chrome';
import useRPCProvider from '../../context/useRpcProvider';
import {SelectedProviderContext} from '../SelectProvider/useSelectedProvider';
import {BlocksContext} from './useBlocks';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import {setupTenderly, TenderlySim} from '../../ethereum/TenderlySim';
import Toolbar from './Toolbar';
import Tabs from './Tabs';
import Simulator from './Simulator';
import Code from './Code';
import {AddBlockContext, defaultResult, stepEnum} from '../AddBlockDialog/useAddBlockDialog';
import AddBlockDialog from '../AddBlockDialog';
import EventsDialog from './EventsDialog';
import SpeechBubble from '../SpeechBubble';

export default function Sandbox() {
	const location = useLocation();
	const {providers} = useRPCProvider();
	const {setDialog} = useChrome();
	const [selectedProvider, setSelectedProvider] = useState();
	const [steps, setSteps] = useState([stepEnum.selectVault]);
	const [result, setResult] = useState(defaultResult());
	const [blocks, setBlocks] = useState([]);
	const [simulating, setSimulating] = useState(false);

	useEffect(() => {
		if(!selectedProvider && providers?.length > 0) {
			setSelectedProvider(providers[0]);
		}
	}, [selectedProvider, setSelectedProvider, providers]);

	const addBlock = useCallback((block) => {
		block.index = blocks.length > 0 
			? blocks[blocks.length - 1].index + 1
			: 0;
		setBlocks(blocks => [...blocks, block]);
	}, [blocks, setBlocks]);

	useEffect(() => {
		if(location.hash === '#add-block') {
			setDialog({component: AddBlockDialog, args: {
				addBlockContext: {selectedProvider, steps, setSteps, result, setResult},
				onAddBlock: addBlock
			}});
		} else if(location.hash.startsWith('#events')) {
			setDialog({component: EventsDialog, args: {blocks}});
		} else {
			setDialog('');
		}
	}, [setDialog, location, blocks, addBlock, selectedProvider, steps, setSteps, result, setResult]);

	async function simulate() {
		setSimulating(true);
		blocks.forEach((block, index) => {block.index = index;});
		const tenderly = await setupTenderly(selectedProvider.network.chainId);
		const result = await TenderlySim(blocks, tenderly);
		setBlocks(result);
		setSimulating(false);
	}

	function removeBlock(index) {
		setBlocks(blocks => {
			return blocks.filter(block => block.index !== index);
		});
	}

	function reset() {
		setBlocks([]);
	}

	return <SelectedProviderContext.Provider value={{selectedProvider, setSelectedProvider}}>
		<AddBlockContext.Provider value={{steps, setSteps, result, setResult}}>
			<BlocksContext.Provider value={{blocks, setBlocks, addBlock, simulate, simulating, removeBlock, reset}}>
				<div className={'grow flex flex-col sm:z-40'}>
					<BiggerThanSmallScreen>
						<Toolbar></Toolbar>
					</BiggerThanSmallScreen>

					<div className={`
						grow sm:mx-4 sm:mb-4 px-4 pt-24 pb-16 sm:px-8 sm:py-0 
						flex flex-col justify-between
						border-4 border-primary-500 dark:border-primary-900/40
						dark:bg-black/20
						sm:rounded-lg
						${simulating ? 'border-selected-600 dark:border-selected-400 animate-pulse' : ''}`}>
						<BiggerThanSmallScreen>
							{(location.hash === '' || location.hash === '#add-block' || location.hash === '#events') &&
								<>
									{blocks.length === 0 && 
										<SpeechBubble text={'The sandbox is empty'} className={'grow justify-center'} />
									}
									{blocks.length > 0 && <Simulator />}
								</>
							}
							{location.hash === '#code' && 
								<Code />}
						</BiggerThanSmallScreen>

						<SmallScreen>
							<Tabs></Tabs>
							{(location.hash === '' || location.hash === '#add-block' || location.hash === '#events') &&
								<Simulator />}
							{location.hash === '#code' && 
								<Code />}
						</SmallScreen>
					</div>
				</div>
			</BlocksContext.Provider>
		</AddBlockContext.Provider>
	</SelectedProviderContext.Provider>;
}
