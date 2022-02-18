import React, {useState} from 'react';



function VaultButtons({vaults, clickFunction}){
	let [filterCurve, setFilterCurve] = useState(true);
	return(<div>
		<button  onClick={() => setFilterCurve(!filterCurve)}>{filterCurve ? 'Show Curve' : 'Hide Curve'}</button>
		<div>
			{vaults.map((vault) => {
            
        
				if(filterCurve && (vault.name.includes('urve') || vault.name.includes('crv'))){
					return '';
				}else{
					return <div key={vault.address}><button  onClick={() => clickFunction(vault)}> {vault.name}{' - '}{vault.version}{' - '}{vault.address}</button></div>;
				}
			})}</div>
	</div>

	);
}



export default VaultButtons;