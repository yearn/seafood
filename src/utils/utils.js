import React from 'react';

function GetExplorerLink(chainId, address){
	return (chainId === 250 ? 'https://ftmscan.com/address/' :  'https://etherscan.io/address/') + address;

}

function GetExplorerTx(chainId, address){
	return (chainId === 250 ? 'https://ftmscan.com/tx/' :  'https://etherscan.io/tx/') + address;

}

function GetALink(url, str){
	return <a target={'_blank'} rel={'noreferrer'} href={url}> {str}</a>;

}

export {GetExplorerLink, GetExplorerTx, GetALink};