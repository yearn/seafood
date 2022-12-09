import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import config from '../config.json';
import {useAuth} from './useAuth';
import {GithubClient} from '../utils/github';

interface SmsInfo {
	access: boolean,
	mainpy: string[]
}

const	SmsContext = createContext<SmsInfo>({access: false, mainpy: []});
export const useSms = () => useContext(SmsContext);
export default function SmsProvider({children} : {children: ReactNode}) {
	const {authenticated, token} = useAuth() as {authenticated: boolean, token: {access_token: string}};
	const mainpyExpression = `${config.sms.main}:${config.sms.script}`;
	const [mainpy, setMainpy] = useState<string[]>([]);
	const [access, setAccess] = useState(false);

	const gh = useMemo(() => {
		if(!authenticated) return;
		return new GithubClient(token.access_token);
	}, [authenticated, token]);

	useEffect(() => {
		gh?.getObjectText(config.sms.owner, config.sms.repo, mainpyExpression).then(
			main => {
				setMainpy(main.split('\n'));
				setAccess(true);
			}).catch(
			error => {
				error; // ignore
			});
	}, [gh, mainpyExpression]);

	return <SmsContext.Provider value={{access, mainpy}}>
		{children}
	</SmsContext.Provider>;
}