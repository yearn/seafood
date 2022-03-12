import React, {useState} from 'react';
import {useLocation} from 'react-router-dom';
import useRPCProvider from '../../context/useRpcProvider';
// import BuildingBlock from '../buildingBlocks/BuildingBlock';
import SimulateBlock from '../buildingBlocks/SimulateBlock';
import PreviewCode from '../buildingBlocks/PreviewCode';
import AddBlockDialog, {AddBlockButton} from '../AddBlockDialog';
import {SelectedProviderContext} from '../SelectProvider/useSelectedProvider';
import SelectProvider from '../SelectProvider';
import {AddBlockDialogProvider} from '../AddBlockDialog/useAddBlockDialog';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import Tabs from './Tabs';
import Block from './Block';
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

	function onRemoveBlock(blockIndex) {
		setBlocks(blocks => {
			return blocks.filter(item => item.index !== blockIndex);
		});
	}

	function onResetBlocks() {
		setBlocks([]);
	}

	return <SelectedProviderContext.Provider value={{selectedProvider, setSelectedProvider}}>
		<div className={'sandbox'}>

			<BiggerThanSmallScreen>
				<div className={'md:w-1/3 flex flex-col items-center'}>
					<SelectProvider disabled={blocks.length > 0}></SelectProvider>
					{blocks.map(block => 
						<Block key={block.index} block={block} onRemove={onRemoveBlock}></Block>
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
							<Block key={block.index} block={block} onRemove={onRemoveBlock}></Block>
						)}
						<div className={'mt-8 mb-32 flex flex-col items-center'}>
							<AddBlockDialogProvider>
								<AddBlockButton></AddBlockButton>
								<AddBlockDialog onAddBlock={onAddBlock}></AddBlockDialog>
							</AddBlockDialogProvider>
							<div>
								<SelectProvider disabled={blocks.length > 0}></SelectProvider>
								{blocks.length > 0 && <button onClick={onResetBlocks}>{'Reset'}</button>}
							</div>
						</div>
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

				<div className={'tabs'}>
					<Tabs></Tabs>
				</div>
			</SmallScreen>

		</div>
	</SelectedProviderContext.Provider>;
}

export default Sandbox;