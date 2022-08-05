import _useLocalStorage from 'use-local-storage';

export default function useLocalStorage(key, defaultValue, options) {
	if(options && options.defaultKeysOnly) {
		options.parser = (str) => {
			const result = {...defaultValue};
			const json = JSON.parse(str);
			Object.keys(result).forEach(key => {
				result[key] = json[key];
			});
			return result;
		};
	}
	return _useLocalStorage(key, defaultValue, options);	
}