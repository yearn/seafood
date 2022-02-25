import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useApp} from '../context/useApp';

export default function Vault() {
	const params = useParams();
	const {vaults} = useApp();
	const [vault, setVault] = useState({});

	useEffect(() => {
		setVault(vaults.find(v => v.address === params.address));
	}, [params, vaults]);

	return <div>
		{vault?.name}
	</div>;
}