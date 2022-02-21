import React, {useState} from 'react';
import {ethers} from 'ethers';
import ContractActions from '../ContractActions';
import {GetBasicVault, GetBasicStrat} from '../../ethereum/EthHelpers';



function BuildManual({provider, clickFunction}){
	
	const [values, setValues] = useState();
	const [block, setBlock] = useState(null);
	const [dropdown, setDropdown] = useState();
    
	console.log(clickFunction);
	console.log(provider);

	const handleChange = (event) => {
		let formatted = event.target.value.trim();

		try{
			let checked = ethers.utils.getAddress(formatted.toLowerCase());
			checkAddress(checked, dropdown);
			setValues(checked);
		}catch{
			setValues(formatted);
		}
		
		

		console.log(event);
	};

	const handleDropdownChange = (event) => {
		
		setDropdown(event.target.value);
		checkAddress(values, event.target.value);


		console.log(event);
	};
  

	function checkAddress(address, dropdown){
		if(dropdown == 0 && block){
			setBlock(null);
			return;
		}

		try{
			let checked = ethers.utils.getAddress(address.toLowerCase());

			if(dropdown == 1){
				GetBasicVault(checked, provider).then(x =>{
					setBlock(x);
				});
			}else if(dropdown ==2){
				GetBasicStrat(checked, provider).then(x =>{
					setBlock(x);
				});
			}
			

		}catch{
			if(block) setBlock(null);
		}
	}
    

	return(<div>
        
		<form >
			<textarea value={values } onChange={handleChange}/>
			<select 
				value={dropdown} 
				onChange={handleDropdownChange} 
			>
				<option value={'0'}>{'Contract Type'}</option>
				<option value={'1'}>{'Vault'}</option>
				<option value={'2'}>{'Strategy'}</option>
		
			</select>

		</form>
		{block && <ContractActions block={block} onSelect={clickFunction} />}
	</div>
          
          
	);
    
}



export default BuildManual;