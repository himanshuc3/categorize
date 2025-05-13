export interface CLIArguments {
	directory: string;
	recursive: boolean;
	exclude: string;
	config: string;
	flat: boolean;
	[key: string]: unknown;
}
