import React, {useState} from 'react';
import {TenderlySim, setupTenderly} from '../../ethereum/TenderlySim';
import ShowEvents from '../ShowEvents';


function SimulateBlock({blocks, chainId, updateBlock}){
	console.log(chainId);
	
	const [finishedBlocks, addBlock] = useState([]);
	const [nonce, setNonce] = useState(0); 
	const [script, setEvents] = useState({});

	function showEvent(block, show) {
		
		setEvents(currentValues => {
			if(show) currentValues[block.tenderlyURL] = block.result;
			else currentValues[block.tenderlyURL] = null;
			return currentValues;
		});
		setNonce(nonce+1); //need to force update because react is stupid
	}

	function runSim(){
		setupTenderly(chainId).then(tenderlyProvider =>{
			TenderlySim(blocks, tenderlyProvider).then(x =>{
				addBlock(x);
				updateBlock(x);
			});
		});
	}
	

	if(finishedBlocks.length ==0){
		return <button  onClick={() => runSim()}> {'Run'}</button>;
	}

	console.log(finishedBlocks);
	return<div>{finishedBlocks.map(block =>{
		return (
			<div key={block.tenderlyURL}>
				<div>{block.function.name + ' on ' + block.block.name } {block.name !== block.block.name && ' on ' + block.name } { <a target={'_blank'} rel={'noreferrer'} href={block.tenderlyURL}> {(block.success ? ' succeeded ' : 'failed ')} </a>}</div>
				{(block.result && !script[block.tenderlyURL] )  && <button onClick={() => showEvent(block, true)} > {'Show Events'}</button>}
				{script[block.tenderlyURL] && <ShowEvents events={block.result.events} />}
				{(block.result && script[block.tenderlyURL] )  && <button onClick={() => showEvent(block, false)} > {'Hide Events'}</button>}
			</div> 
		);
	})}</div>;

}



export default SimulateBlock;