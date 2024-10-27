import boxen from 'boxen';
import { TConfig, TExtension } from '../types';

export const flatMapExtensionToFolder = (config: TConfig) => {
	return config.default.reduce((acc: object, val: TExtension) => {
		let extMap: { [key: string]: string } = {};

		if (val.extensions) {
			for (const ext of val.extensions) {
				extMap[ext] = val.name;
			}
		}
		return {
			...acc,
			...extMap
		};
	}, {});
};

export function assertIsValidObject(obj: any): asserts obj is Object {
	if (typeof obj !== 'object' || obj === null) {
		throw new Error(`${obj} is not a valid Object`);
	}
}

export function assertIsString(val: any): asserts val is string {
	if (typeof val !== 'string') {
		throw new Error(`${val} is not of type string.`);
	}
}

export function assertIsArray<T>(val: T[]): asserts val is T[] {
	if (!Array.isArray(val)) {
		throw new Error(`${val} is not of type string.`);
	}
}

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
	if (val === undefined || val === null) {
		throw new Error(`Expected 'val' to be defined, but received ${val}`);
	}
}

export function assertConfigIsValid(config: any): asserts config is TConfig {
	assertIsValidObject(config);
	assertIsDefined(config.default);
	assertIsArray<TExtension>(config.default);

	config.default.forEach((v: TExtension) => assertIsExtensionObject(v));

	if ('prefix' in config) {
		assertIsString(config.prefix);
	}
}

export function assertIsExtensionObject(
	extObj: any
): asserts extObj is TExtension {
	assertIsValidObject(extObj);
	assertIsString(extObj.name);
	assertIsArray(extObj.extensions);

	if (extObj.extensions.find((v: any) => typeof v !== 'string')) {
		throw new Error(
			`All values in extensions array of ${name} are not string`
		);
	}
}
