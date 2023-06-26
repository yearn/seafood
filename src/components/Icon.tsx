import React from 'react';

export default function Icon({onClick, className}: {onClick?: () => void, className?: string}) {
	return <img onClick={onClick} src={'/mechafish.png'} alt={'Seafood'} className={className} />;
}