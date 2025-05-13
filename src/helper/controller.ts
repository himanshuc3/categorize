import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Reader from '../reader/index.js';
import renderText from './displayText.js';
import { info } from './logger';

export default class Controller {
	// options: {
	//     directory: string;
	//     recursive: boolean;
	// 	exclude: string;
	// 	config: string;

	// }

	constructor() {
		this.options = null;
		this.reader = new Reader();
	}

	parseArguments() {
		// const greeting = chalk.white.bold("Hello!");
		this.options = yargs(hideBin(process.argv))
			.usage(
				'Usage: categorize -d <directory> -r -e <exclude> -c <config> -f'
			)
			.option('d', {
				alias: 'directory',
				default: '.',
				describe: 'Directory to organize',
				type: 'string',
				demandOption: false
			})
			.option('r', {
				alias: 'recursive',
				default: false,
				describe: 'Recursively organize each subdirectory',
				type: 'boolean',
				demandOption: false
			})
			.option('e', {
				alias: 'exlude',
				default: 'null',
				describe: 'Exclude files and directories using regex provided',
				type: 'string',
				demandOption: false
			})
			.option('c', {
				alias: 'config',
				default: 'null',
				describe:
					'Describe the config for mapping folders to extensions',
				type: 'string',
				demandOption: false
			})
			.option('f', {
				alias: 'flat',
				default: false,
				describe: 'Flat map all files to root directory',
				type: 'boolean',
				demandOption: false
			})
			.help('h')
			.alias('h', 'help').argv;

		info(`Options: ${JSON.stringify(this.options)}`);
		this.reader.setRootDirectory(this.options.directory);

		if (this.options.config !== null) {
			this.reader.setExtensionsConfig(this.options.config);
		}
		this.reader.setFlat(this.options.flat);
	}

	initiateSegregation() {
		this.reader.organize();
	}
}
