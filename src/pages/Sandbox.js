import React, {useState} from 'react';
import useRPCProvider from '../context/useRpcProvider';
// import BuildingBlock from '../components/buildingBlocks/BuildingBlock';
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
		<div className={'grow px-2 pt-8 flex flex-col md:flex-row'}>

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
					<h3>{'Run Code In Fork'} </h3>
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

		</div>
	</SelectedProviderContext.Provider>;
}

export default Sandbox;