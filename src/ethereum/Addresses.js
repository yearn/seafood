function SpookySwapRouter(){
	return '0xF491e7B69E4244ad4002BC14e878a34207E38c29';
}
function SpiritSwapRouter(){
	return '';
}

function fantomMasterchefs(){
	return [
		'0x4cF620a388d36Fb527ddc03a515b8677c14A967a', //draco
		'0x82CbD2AF730D3dC3715873eA030851D7f3206Bcd', //wftm scarface
		'0x32aC76a38027C95662d727aee9D9Bb3028197ba7', //usdc scarface
	];
}

function ethVaults(){
	return [
		'0xdA816459F1AB5631232FE5e97a05BBBb94970c95', //newdai
		'0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE', //newusdc
		'0xa258C4606Ca8206D8aA700cE2143D7db854D168c', //newweth
		'0x7Da96a3891Add058AdA2E826306D812C638D87a7', //newusdt
		'0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E', //newwbtc
		'0xdb25cA703181E7484a155DD612b06f57E12Be5F0', //newyfi
		'0x0F6121fB28C7C42916d663171063c62684598f9F']; //hbtc
}

function ftmVaults(){
	return [
		'0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0', //wftm
		'0xEF0210eB96c7EB36AF8ed1c20306462764935607']; //usdc
}

export {SpiritSwapRouter, SpookySwapRouter, fantomMasterchefs, ftmVaults, ethVaults};