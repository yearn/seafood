import React, {useState} from 'react';
import useRPCProvider from '../context/useRpcProvider';
import ProviderSelector from '../components/ProviderSelector';
import BuildingBlock from '../components/buildingBlocks/BuildingBlock';
import BuiltBlock from '../components/buildingBlocks/BuiltBlock';
import SimulateBlock from '../components/buildingBlocks/SimulateBlock';
import PreviewCode from '../components/buildingBlocks/PreviewCode';
import BuildingBlockDialog from '../components/buildingBlocks/BuildingBlockDialog';

function Sandbox() {
	const {defaultProvider} = useRPCProvider();
	const [provider, setProvider] = useState(defaultProvider);
	const [blocks, setBlocks] = useState([]);
	const [nonce, setNonce] = useState(0);
	const [buildingBlockDialogState, setBuildingBlockDialogState] = useState({
		show: false,
		provider
	});

	function addBlock(block) {
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

	return <div>
		<ProviderSelector setProvider={provider => setProvider(provider)} />

		{blocks.map(block => 
			<BuiltBlock key={block.index} block={block} removeBlock={removeBlock} />
		)}

		<h3>{'Run Code In Fork'} </h3>
		{blocks.length > 0 && 
			<SimulateBlock blocks={blocks} updateBlock={updateBlock} chainId={provider.network.chainId} />
		}

		<PreviewCode blocks={blocks} />

		<h3>{'Add new'} </h3>
		<BuildingBlock addBlock={addBlock} provider={provider} />

		<button onClick={() => setBuildingBlockDialogState(state => {return {...state, show:true};})}>{'Add block'}</button>
		<BuildingBlockDialog state={buildingBlockDialogState} setState={setBuildingBlockDialogState}></BuildingBlockDialog>
	</div>;

	//three components
	//the builder




	//the display of the code


	//the results when run




}

export default Sandbox;