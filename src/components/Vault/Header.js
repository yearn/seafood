import React from 'react';
import {motion} from 'framer-motion';
import useScrollOverpass from '../../context/useScrollOverpass';
import {useSimulator} from './SimulatorProvider';
import {getAddressExplorer, truncateAddress} from '../../utils/utils';
import {A} from '../controls';
import {useVault} from './VaultProvider';
import Chip from './Chip';
import CopyButton from './CopyButton';
import Tools from './Tools';
import {BiggerThanSmallScreen} from '../../utils/breakpoints';
import SimulatorStatus from './SimulatorStatus';

export default function Header() {
	const {vault, provider} = useVault();
	const {overpassClassName} = useScrollOverpass();
	const {engaged} = useSimulator();

	return <div className={`
		sticky top-0 z-10 pb-4 sm:py-2
		sm:grid sm:grid-cols-2 sm:items-center
		${overpassClassName}`}>
		<div className={'flex flex-col sm:flex-col-reverse'}>
			<div className={'w-full sm:w-fit py-5 pr-4 sm:py-2 sm:pr-0 flex items-center justify-between gap-4'}>
				<div className={'w-1/5 sm:w-0'}></div>
				<Chip className={`bg-${provider.network.name}`}>{provider.network.name}</Chip>
				<Chip className={'bg-primary-400 dark:bg-primary-900'}>{vault.version}</Chip>
				<A target={'_blank'} href={getAddressExplorer(provider.network.chainId, vault.address)} rel={'noreferrer'}>
					{truncateAddress(vault.address)}
				</A>
				<CopyButton clip={vault.address}></CopyButton>
			</div>

			<div className={'sm:w-fit px-4 flex flex-col sm:flex-row sm:items-center sm:gap-8'}>
				<h1 onClick={() => {
					window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
				}} className={'font-bold text-5xl cursor-pointer'}>{vault.name}</h1>
			</div>
		</div>
		<BiggerThanSmallScreen>
			<div className={'relative mr-12 ml-8 flex flex-col'}>
				<Tools />
				<div className={'absolute left-0 top-[3.3rem] z-10 w-full'}>
					{engaged && <motion.div className={'w-full'}
						transition={{ease: 'easeOut', duration: .25}}
						initial={{y: '0%'}}
						animate={{y: '50%'}}>
						<SimulatorStatus />
					</motion.div>}
				</div>
			</div>
		</BiggerThanSmallScreen>
	</div>;
}