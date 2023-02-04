export function scoreToBgColor(score: number) {
	switch(Math.ceil(score)) {
	case 1 : return 'bg-green-900';
	case 2 : return 'bg-green-600';
	case 3 : return 'bg-yellow-500';
	case 4 : return 'bg-orange-500';
	case 5 : return 'bg-red-600';
	default: return 'bg-transparent';
	}
}

export function scoreToBorderColor(score: number) {
	switch(Math.ceil(score)) {
	case 1 : return 'border-green-900';
	case 2 : return 'border-green-600';
	case 3 : return 'border-yellow-500';
	case 4 : return 'border-orange-500';
	case 5 : return 'border-red-600';
	default: return 'border-transparent';
	}
}

export function scoreToTextColor(score: number) {
	switch(Math.ceil(score)) {
	case 1 : return 'text-green-900';
	case 2 : return 'text-green-600';
	case 3 : return 'text-yellow-500';
	case 4 : return 'text-orange-500';
	case 5 : return 'text-red-600';
	default: return 'text-transparent';
	}
}
