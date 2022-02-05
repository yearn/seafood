import ConnectR from "../ethereum/ConnectRpc"
import ShowVault from "../ethereum/ShowVaults"

import useRPCProvider from '../context/useRpcProvider'
import { useState } from "react";



function DefaultPage(){
    const {tenderlyProvider, initProvider, closeProvider, defaultProvider, setupTenderly} = useRPCProvider();
    const [dfP, setupP] = useState(null);
    initProvider()
    if(!defaultProvider){
        return(<div>loading...</div>)
    }
    if(!tenderlyProvider){
        return(<div>
            {"no provider detected"}
            <button onClick={setupTenderly}> Set Up Tenderly</button>

            
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