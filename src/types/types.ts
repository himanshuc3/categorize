export interface CLIArguments {
	directory: string;
	recursive: boolean;
	exclude: string;
	config: string;
	flat: boolean;
	dryRun: boolean;
	[key: string]: unknown;
}
