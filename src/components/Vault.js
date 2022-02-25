import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useApp} from '../context/useApp';
import SingleVaultPage from '../pages/SingleVault';

export default function Vault() {
	const params = useParams();
	const {vaults} = useApp();
	const [vault, setVault] = useState({});

	useEffect(() => {
		setVault(vaults.find(v => v.address === params.address));
	}, [params, vaults]);

	return <SingleVaultPage value={vault}></SingleVaultPage>;
}