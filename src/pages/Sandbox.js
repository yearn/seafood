import React, {useState} from 'react';
import useRPCProvider from '../context/useRpcProvider';
import BuildingBlock from '../components/buildingBlocks/BuildingBlock';
import BuiltBlock from '../components/buildingBlocks/BuiltBlock';
import SimulateBlock from '../components/buildingBlocks/SimulateBlock';
import PreviewCode from '../components/buildingBlocks/PreviewCode';
import AddBlockDialog, {AddBlockButton} from '../components/AddBlockDialog';
import {SelectedProviderContext} from '../components/SelectProvider/useSelectedProvider';
import SelectProvider from '../components/SelectProvider';
import {AddBlockDialogProvider} from '../components/AddBlockDialog/useAddBlockDialog';

function Sandbox() {
	const {defaultProvider} = useRPCProvider();
	const [selectedProvider, setSelectedProvider] = useState(defaultProvider);
	const [blocks, setBlocks] = useState([]);
	const [nonce, setNonce] = useState(0);

	function addBlock(block) {
		block.index = nonce;
		setNonce(nonce+1);
		setBlocks(blocks => [...blocks, block]);
	}

	function onAddBlock(block) {
		console.log('block', block);
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
		<div>
			<SelectProvider></SelectProvider>

			{blocks.map(block => 
				<BuiltBlock key={block.index} block={block} removeBlock={removeBlock} />
			)}

			<h3>{'Run Code In Fork'} </h3>
			{blocks.length > 0 && 
				<SimulateBlock blocks={blocks} updateBlock={updateBlock} chainId={selectedProvider.network.chainId} />
			}

			<PreviewCode blocks={blocks} />

			<h3>{'Add new'} </h3>
			<BuildingBlock addBlock={addBlock} provider={selectedProvider} />

			<AddBlockDialogProvider>
				<AddBlockButton></AddBlockButton>
				<AddBlockDialog onAddBlock={onAddBlock}></AddBlockDialog>
			</AddBlockDialogProvider>
		</div>
	</SelectedProviderContext.Provider>;

	//three components
	//the builder




	//the display of the code


	//the results when run




}

export default Sandbox;