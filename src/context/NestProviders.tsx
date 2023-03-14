import React, {ReactNode} from 'react';

type Factory = [
	provider: ({children}: {children: ReactNode}) => JSX.Element,
	params?: object
]

const NestProviders = (providers: Factory[])
	: ({children}: {children: ReactNode}) => JSX.Element => {
	if(providers.length === 0) throw 'Where my providers at?';

	if (providers.length === 1) {
		return providers[0][0];
	}

	const [A, paramsA] = providers.shift() as Factory;
	const [B, paramsB] = providers.shift() as Factory;

	return NestProviders([
		[({children}: {children: ReactNode}) => (
			<A {...(paramsA || {})}>
				<B {...(paramsB || {})}>
					{children}
				</B>
			</A>
		)],
		...providers,
	]);
};

export default NestProviders;
