import {ethers} from 'ethers';
import _useLocalStorage from 'use-local-storage';

function hydrateBigNumbersRecursively(object, depth = 1) {
	if(Array.isArray(object)) {
		object.forEach(o => hydrateBigNumbersRecursively(o, depth + 1));
	} else {
		Object.keys(object).forEach(key => {
			const value = object[key];
			if(typeof value === 'object') {
				if(value.type === 'BigNumber') {
					object[key] = ethers.BigNumber.from(object[key].hex);
				} else {
					hydrateBigNumbersRecursively(value, depth + 1);
				}
			}
		});
	}
}

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