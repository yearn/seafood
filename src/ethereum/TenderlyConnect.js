import React from 'react';
import useRPCProvider from '../context/useRpcProvider';

function TenderlySetup({chainId}){

	const {tenderlyProvider, closeProvider, setupTenderly} = useRPCProvider();

	console.log(chainId);
	if(!tenderlyProvider){
		return(<div>
			{'no provider detected'}
			<button onClick={() => {setupTenderly(chainId);}}>{' Set Up Tenderly'}</button>
            
            
		</div>
		);
    
	}else{
		return(
			<div><div>
				{'Tenderly fork is: '}<a target={'_blank'} href={'https://dashboard.tenderly.co/yearn/yearn-web/fork/' + tenderlyProvider.connection.url.substring(29)} rel={'noreferrer'}>{'https://dashboard.tenderly.co/yearn/yearn-web/fork/' + tenderlyProvider.connection.url.substring(29)} </a></div>
			<button onClick={closeProvider}>{' Close'}</button>
			</div>
            
		);
	}
}

export default TenderlySetup;

