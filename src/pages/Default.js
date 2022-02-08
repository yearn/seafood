import React from 'react';
import ShowVault from '../ethereum/ShowVaults';
import useRPCProvider from '../context/useRpcProvider';

function DefaultPage(){
	const {tenderlyProvider, closeProvider, setupTenderly} = useRPCProvider();

    
	if(!tenderlyProvider){
		return(<div>
			{'no provider detected'}
			<button onClick={setupTenderly}>{' Set Up Tenderly'}</button>
			<div><ShowVault /></div>
            
		</div>
		);

	}else{
		return(
			<div><div>
				{'Tenderly fork is: '}<a target={'_blank'} href={'https://dashboard.tenderly.co/yearn/yearn-web/fork/' + tenderlyProvider.connection.url.substring(29)} rel={'noreferrer'}>{'https://dashboard.tenderly.co/yearn/yearn-web/fork/' + tenderlyProvider.connection.url.substring(29)} </a></div>
			<button onClick={closeProvider}>{' Close'}</button>
			<div><ShowVault /></div>
			</div>
            
		);
	}
	/*return (

    <div><ConnectR /></div>
    );*/
}

export default DefaultPage;