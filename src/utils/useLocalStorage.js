import _useLocalStorage from 'use-local-storage';
import {hydrateBigNumbersRecursively} from './utils';

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

	if(options && options.parseBigNumbers) {
		options.parser = (str) => {
			const json = JSON.parse(str);
			hydrateBigNumbersRecursively(json);
			return json;
		};
	}

	return _useLocalStorage(key, defaultValue, options);	
}