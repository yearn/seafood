/* eslint-disable @typescript-eslint/no-explicit-any */
export default function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
	const output: Record<string, any> = Object.assign({}, target);

	if (isObject(target) && isObject(source)) {
		Object.keys(source).forEach(key => {
			if (isObject(source[key]) && isObject(target[key])) {
				output[key] = deepMerge(target[key], source[key]);
			} else {
				output[key] = source[key];
			}
		});

		Object.keys(target).forEach(key => {
			if (!(key in source)) {
				output[key] = target[key];
			}
		});
	}

	return output;
}

function isObject(item: any): item is Record<string, any> {
	return (item && typeof item === 'object' && !Array.isArray(item));
}
