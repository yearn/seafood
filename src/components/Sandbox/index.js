import React, {useState} from 'react';
import {useLocation} from 'react-router-dom';
import useRPCProvider from '../../context/useRpcProvider';
import {SelectedProviderContext} from '../SelectProvider/useSelectedProvider';
import {BlocksContext} from './useBlocks';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import Tabs from './Tabs';
import Simulator from './Simulator';
import Code from './Code';
import './index.css';

export default function Sandbox() {
	const location = useLocation();
	const {defaultProvider} = useRPCProvider();
	const [selectedProvider, setSelectedProvider] = useState(defaultProvider);
	const [blocks, setBlocks] = useState([]);

	return <SelectedProviderContext.Provider value={{selectedProvider, setSelectedProvider}}>
		<BlocksContext.Provider value={{blocks, setBlocks}}>
			<div className={'sandbox'}>
				<Tabs></Tabs>

				<BiggerThanSmallScreen>
					{/* <div className={'md:w-1/3 flex flex-col items-center'}>
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
					</div> */}
				</BiggerThanSmallScreen>

				<SmallScreen>
					{(location.hash === '' || location.hash === '#add-block') &&
						<Simulator />}
					{location.hash === '#code' && 
						<Code />}
				</SmallScreen>

			</div>
		</BlocksContext.Provider>
	</SelectedProviderContext.Provider>;
}