import ConnectR from "../ethereum/ConnectRpc"
import ShowVault from "../ethereum/ShowVaults"

import useRPCProvider from '../context/useRpcProvider'



function DefaultPage(){
    const {tenderlyProvider, initProvider, closeProvider, setupTenderly} = useRPCProvider();
    if(!tenderlyProvider){
        return(<div>
            {"no provider detected"}
            <button onClick={setupTenderly}> Set Up Tenderly</button>
            <button onClick={initProvider}> Use Default Provider</button>

            
            </div>
        )

    }else{
        return(
            <div><div>
                {"Tenderly fork is: " + tenderlyProvider.connection.url}</div>
                <button onClick={closeProvider}> Close</button>
                <div><ShowVault /></div>
            </div>
            
        )
    }
    /*return (

    <div><ConnectR /></div>
    );*/
}

export default DefaultPage;