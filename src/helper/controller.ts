import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Reader from '../reader/index.js';
import { info } from './logger';
import { CLIArguments } from '../types/types.js';

export default class Controller {
	private options: CLIArguments;
	private reader: Reader;

	constructor() {
		this.options = this.parseArguments();
		this.reader = new Reader();
	}

	parseArguments(): CLIArguments {
		const options: CLIArguments = yargs(hideBin(process.argv))
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
				alias: 'exclude',
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
			.option('o', {
				alias: 'dryRun',
				default: false,
				describe: 'Output the final file tree before organizing',
				type: 'boolean',
				demandOption: false
			})
			.help('h')
			.alias('h', 'help').argv;

		info(`Options: ${JSON.stringify(options)}`);
		return options;
	}

	async setReaderOptions() {
		this.reader.initOptions(this.options);
	}

	initiateSegregation() {
		this.reader.organize();
	}
}
