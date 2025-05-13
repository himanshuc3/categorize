const chalk = require('chalk');

export function error(message: string) {
	console.error(chalk.red(message));
}

export function warn(message: string) {
	console.warn(chalk.yellow(message));
}

export function info(message: string) {
	console.log(chalk.green('*********'));
	console.log(chalk.green(message));
	console.log(chalk.green('*********'));
}
