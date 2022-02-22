import React, {useState} from 'react';
import useRPCProvider from '../context/useRpcProvider';
import ProviderSelector from '../components/ProviderSelector';
import BuildingBlock from '../components/buildingBlocks/BuildingBlock';
import BuiltBlock from '../components/buildingBlocks/BuiltBlock';
import SimulateBlock from '../components/buildingBlocks/SimulateBlock';
import PreviewCode from '../components/buildingBlocks/PreviewCode';


function Sandbox() {

	const {defaultProvider} = useRPCProvider();

	let [provider, setProvider] = useState(defaultProvider);
	let [blocks, setBlocks] = useState([]);
	let [nonce, setNonce] = useState(0);

	console.log(blocks);

	function addTheBlock(block) {
		block.index = nonce;
		setNonce(nonce+1);
		setBlocks([...blocks, block]);

	}

	function updateTheBlock(block) {
		setBlocks(block);

	}
	function removeBlock(blockIndex) {
		setBlocks(blocks.filter(item => item.index !== blockIndex));
	}

	

	return (<div>
		<ProviderSelector selectFunction={setProvider} />

		{blocks.map(block => <BuiltBlock key={block.index} block={block} removeBlock={removeBlock} />)}
		<h3>{'Run Code In Fork'} </h3>
		{blocks.length > 0 && <SimulateBlock blocks={blocks} updateBlock={updateTheBlock} chainId={provider.network.chainId} />}
		
		<PreviewCode blocks={blocks} />
		

		<h3>{'Add new'} </h3>
		<BuildingBlock addBlock={addTheBlock} provider={provider} />
    
	</div>);

	//three components
	//the builder




	//the display of the code


	//the results when run




}

export default Sandbox;