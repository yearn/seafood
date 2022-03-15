import React, {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import CloseDialog from '../CloseDialog';
import ShowEvents from '../ShowEvents';

export default function EventsDialog({block}) {
	const location = useLocation();
	const navigate = useNavigate();
	const [show, setShow] = useState(false);

	useEffect(() => {
		setShow(location.hash === '#events');
	}, [location]);

	function close() {
		navigate(-1);
	}

	return <div className={`dialog-container${show ? '' : ' invisible'}`}>
		<div className={'dialog'}>
			<SmallScreen>
				<CloseDialog></CloseDialog>
			</SmallScreen>

			<div className={'grow'}>
				{block?.result?.events.length > 0 && <div className={'max-h-full flex flex-col'}>
					<div className={'px-4 pt-4 pb-8'}>
						<h2 className={'text-xl'}>{'Events'}</h2>
					</div>
					<div className={'tiles px-4'}>
						<ShowEvents events={block.result.events} />
					</div>
				</div>}
				{!block?.result?.events.length && <div className={'h-full flex items-center justify-center text-2xl'}>
					{'No events'}
				</div>}
			</div>

			<div className={'flex items-center justify-end'}>
				<BiggerThanSmallScreen>
					<button onClick={close}>{'Cancel'}</button>
				</BiggerThanSmallScreen>
			</div>
		</div>
		<div onClick={close} className={'absolute -z-10 inset-0'}></div>
	</div>;
}