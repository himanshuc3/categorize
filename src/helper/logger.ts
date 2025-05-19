const chalk = require('chalk');
const debug = require('debug');

debug.enable('*');

export function error(message: string) {
	console.error(chalk.red(message));
	process.exit(1);
	// return throw Error("mes")
}

export function warn(message: string) {
	console.warn(chalk.yellow(message));
}

export function info(message: string) {
	console.log(chalk.green(message));
}

export function debugModule(module: string) {
	return debug(module);
}

export const debugReader = debugModule('reader');
export const debugApplication = debugModule('negentropy');
