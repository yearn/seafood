import useRPCProvider from '../context/useRpcProvider';
import {GetMasterchef} from  '../ethereum/EthHelpers';
import React, {useState,useEffect} from 'react';


function MasterchefPage(){
	const {fantomProvider} = useRPCProvider();
    let [allV, setAllv] = useState();

    let fantomstrats = ['0x4cF620a388d36Fb527ddc03a515b8677c14A967a'];


    useEffect(() => {
		GetMasterchef(fantomstrats, fantomProvider).then(v => { setAllv(v);});
	}, [fantomProvider]);
    console.log(allV);
    return <div>{allV}</div>;

}

export default MasterchefPage;