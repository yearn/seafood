export function scoreToBgColor(score: number, alpha = false) {
	switch(Math.ceil(score)) {
	case 0 : return alpha ? 'bg-red-950/40' : 'bg-red-950';
	case 1 : return alpha ? 'bg-green-900/40' : 'bg-green-900';
	case 2 : return alpha ? 'bg-green-600/40': 'bg-green-600';
	case 3 : return alpha ? 'bg-yellow-500/40' : 'bg-yellow-500';
	case 4 : return alpha ? 'bg-orange-500/40' : 'bg-orange-500';
	case 5 : return alpha ? 'bg-red-600/40' : 'bg-red-600';
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
