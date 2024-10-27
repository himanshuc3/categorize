export type TExtension = {
	name: string;
	extensions: string[];
};

export type TConfig = {
	default: TExtension[];
	prefix?: string;
	extra: {
		name: string;
	};
};
