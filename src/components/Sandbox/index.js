import React, {useState} from 'react';
import {useLocation} from 'react-router-dom';
import useRPCProvider from '../../context/useRpcProvider';
// import BuildingBlock from '../buildingBlocks/BuildingBlock';
import BuiltBlock from '../buildingBlocks/BuiltBlock';
import SimulateBlock from '../buildingBlocks/SimulateBlock';
import PreviewCode from '../buildingBlocks/PreviewCode';
import AddBlockDialog, {AddBlockButton} from '../AddBlockDialog';
import {SelectedProviderContext} from '../SelectProvider/useSelectedProvider';
import SelectProvider from '../SelectProvider';
import {AddBlockDialogProvider} from '../AddBlockDialog/useAddBlockDialog';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import Tabs from './Tabs';
import './index.css';

function Sandbox() {
	const location = useLocation();
	const {defaultProvider} = useRPCProvider();
	const [selectedProvider, setSelectedProvider] = useState(defaultProvider);
	const [blocks, setBlocks] = useState([]);
	const [nonce, setNonce] = useState(0);

	// function addBlock(block) {
	// 	block.index = nonce;
	// 	setNonce(nonce+1);
	// 	setBlocks(blocks => [...blocks, block]);
	// }

	function onAddBlock(block) {
		block.index = nonce;
		setNonce(nonce+1);
		setBlocks(blocks => [...blocks, block]);
	}

	function updateBlock(block) {
		setBlocks(block);
	}

	function removeBlock(blockIndex) {
		setBlocks(blocks => {
			return blocks.filter(item => item.index !== blockIndex);
		});
	}

	return <SelectedProviderContext.Provider value={{selectedProvider, setSelectedProvider}}>
		<div className={'grow px-2 md:pt-8 flex flex-col justify-between md:flex-row'}>

			<BiggerThanSmallScreen>
				<div className={'md:w-1/3 flex flex-col items-center'}>
					<SelectProvider></SelectProvider>
					{blocks.map(block => 
						<BuiltBlock key={block.index} block={block} removeBlock={removeBlock} />
					)}
					<AddBlockDialogProvider>
						<AddBlockButton></AddBlockButton>
						<AddBlockDialog onAddBlock={onAddBlock}></AddBlockDialog>
					</AddBlockDialogProvider>
				</div>

				<div className={'md:w-2/3 md:px-8'}>
					<div>
						{blocks.length > 0 && 
							<SimulateBlock blocks={blocks} updateBlock={updateBlock} chainId={selectedProvider.network.chainId} />
						}
					</div>
					<div className={'rounded-xl shadow-md'}>
						<PreviewCode blocks={blocks} />
					</div>
				</div>

				{/* <h3>{'Add new'} </h3>
				<BuildingBlock addBlock={addBlock} provider={selectedProvider} /> */}
			</BiggerThanSmallScreen>

			<SmallScreen>
				<div className={'grow flex flex-col justify-center'}>
					{(location.hash === '' || location.hash === '#add-block') && <>
						{blocks.map(block => 
							<BuiltBlock key={block.index} block={block} removeBlock={removeBlock} />
						)}
						<SelectProvider></SelectProvider>
						<AddBlockDialogProvider>
							<AddBlockButton></AddBlockButton>
							<AddBlockDialog onAddBlock={onAddBlock}></AddBlockDialog>
						</AddBlockDialogProvider>
					</>}

					{location.hash === '#run' && 
						<SimulateBlock blocks={blocks} updateBlock={updateBlock} chainId={selectedProvider.network.chainId} />
					}

					{location.hash === '#code' && 
						<div className={'rounded-xl shadow-md'}>
							<PreviewCode blocks={blocks} />
						</div>
					}
				</div>
				<Tabs></Tabs>
			</SmallScreen>

		</div>
	</SelectedProviderContext.Provider>;
}

export default Sandbox;