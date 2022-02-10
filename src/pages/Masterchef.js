import useRPCProvider from '../context/useRpcProvider';
import {GetMasterchef} from  '../ethereum/EthHelpers';
import React, {useState,useEffect} from 'react';


function MasterchefPage(){
    const {fantomProvider} = useRPCProvider();
    let [allV, setAllv] = useState([]);

    let fantomstrats = ['0x4cF620a388d36Fb527ddc03a515b8677c14A967a'];


    useEffect(() => {
        GetMasterchef(fantomstrats, fantomProvider).then(v => { setAllv(v);});
    }, [fantomProvider]);

    const divStyle = {
        width: '100%',
        height: '800px'
      };

    console.log(allV);
    if(allV.length > 0){
        return <div>{allV.map((strat) => (
            <div key={strat.address}> <h3>{strat.name}</h3>
            <div>  {'Deposited: ' + strat.currentDeposits.toLocaleString(undefined, {maximumFractionDigits:2}) + ' '+ strat.wantToken.name + ' which is ' + ((strat.currentDeposits/ strat.totalMasterChefDeposits)*100).toLocaleString(undefined, {maximumFractionDigits:2}) + '% of total deposits' }  </div> 
            <div>  {'Time left: ' + strat.masterchef.timeLeft.toLocaleString(undefined, {maximumFractionDigits:2}) + 'h '}  </div> 
            <ul>
                <li><a target={'_blank'} rel={'noreferrer'} href={strat.url}> {'Strat: ' + strat.address} </a></li>
                <li><a target={'_blank'} rel={'noreferrer'} href={strat.masterchef.url}> {'Masterchef: ' + strat.masterchef.address} </a></li>
                <li><a target={'_blank'} rel={'noreferrer'} href={strat.emissionToken.url}> {'EmissionToken ' + strat.emissionToken.name + ': '+ strat.emissionToken.address} </a></li>
            </ul>
            <br />
            <iframe style={divStyle} src={strat.emissionToken.dexScreener}></iframe>
            <br /></div>
            ))}
            </div>;
    }else{
        return <div>{'loading...'}</div>;
    }
    
    

}

export default MasterchefPage;
