// TODO: Promisify later, if helpful for tree shaking
// but since it's a built in, not really necessary.
import asyncFS from 'fs/promises';
import fs from 'fs';
import path from 'path';
import extensions from '../helper/extensions';
import { assertConfigIsValid, flatMapExtensionToFolder } from '../helper/utils';
import { ROOT_DIR, READ_TYPES } from './constants';
import { error, info } from '../helper/logger';
import { CLIArguments } from '../types/types';
import tree from 'tree-console';

// Problems:
// 1. Resolving clashing directory names
// 2. Fast async of multiple async dir file reads
// 3. Recursive reading of multiple directories
export default class DirReader {
	private _rootDir: string;
	private options: { [key: string]: unknown };
	private prefix: string;
	private flatRepos: { [key: string]: Set<string> };
	constructor(rootDir: string = ROOT_DIR) {
		this.setRootDirectory(rootDir);
		this._rootDir = process.cwd();
		this.options = {};
		this.extensionMap(extensions);
		this.prefix = extensions.prefix || 'categorize';
		this.excluded = {
			files: new Set('.', '..'),
			folders: new Set([
				...extensions.default.map(
					({ name }) => this.prefix + '_' + name
				),
				this.prefix + '_' + extensions.extra.name
			])
		};
		this.excludedRegex = new RegExp('a^');
		this.flatRepos = {};
	}

	async initOptions(options: CLIArguments) {
		this.setRootDirectory(options.directory);
		this.options.recursive = options.recursive || false;

		if (this.options.config !== null) {
			this.setExtensionsConfig(options.config);
		}
		this.options.dryRun = options.dryRun || false;

		if (options.exclude) {
			this.excludedRegex = new RegExp(options.exclude);
		}
		await this.setFlat(options.flat);
	}

	async setExtensionsConfig(configPath: string) {
		try {
			const configFile = await asyncFS.readFile(
				path.join(process.cwd(), configPath)
			);
			assertConfigIsValid(configFile);

			this.extensionMap(configFile);
			this.prefix = configFile.prefix || 'categorize';
			this.excluded.folders = new Set([
				...configFile.default.map(
					({ name }) => this.prefix + '_' + name
				)
			]);

			if (configFile?.extra?.name) {
				this.excluded.folders.add(configFile.extra.name);
			}
		} catch (err) {
			console.log(err);
		}
	}

	extensionMap = (configFile?: object) => {
		this.options.config = configFile;
		this.extensions = flatMapExtensionToFolder(configFile || extensions);
	};

	async setRootDirectory(dir = '.') {
		// absolute path
		if (dir.startsWith('/')) {
			if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
				error(`Absolute Directory: ${dir} does not exist.`);
			}
			this._rootDir = dir;
		} else if (dir == '.') {
			this._rootDir = process.cwd();
		} else {
			const relPath = path.join(process.cwd(), dir);
			if (
				!fs.existsSync(relPath) ||
				!fs.lstatSync(relPath).isDirectory()
			) {
				error(`Directory: ${relPath} does not exist.`);
			}
			this._rootDir = relPath;
		}
	}

	async createNewDirectory(newDirectory: string) {
		try {
			await asyncFS.access(newDirectory);
		} catch (_err) {
			info(`Directory: ${newDirectory} created`);
			await asyncFS.mkdir(newDirectory);
		}
	}

	async isFileExisting(file: string) {
		try {
			await asyncFS.access(file);
			return true;
		} catch (_err) {
			return false;
		}
	}

	async sortFilesInDirectory(dir, outputFileTree: any) {
		const dirMapping = dir.file.reduce((acc, file) => {
			const { name, parentPath } = file;
			let extension = name.split('.');
			extension =
				extension.length > 1 ? extension[extension.length - 1] : '';
			const folderName =
				this.prefix +
				'_' +
				(this.extensions[extension] ||
					this.options.config.extra.name ||
					'misc');

			if (folderName in acc) {
				return {
					...acc,
					[folderName]: [...acc[folderName], file]
				};
			} else {
				return {
					...acc,
					[folderName]: [file]
				};
			}
		}, {});

		if (this.options.dryRun) {
			for (const key in dirMapping) {
				const files = dirMapping[key];
				if (this.options.flat) {
					files.forEach((file: { name: string }) => {
						if (this.excludedRegex.test(file.name)) {
							outputFileTree.children.push({
								name: file.name,
								children: []
							});
						} else if (this.flatRepos[key].has(file.name)) {
							this.flatRepos[key].add(
								`${Date.now()} + '-' + ${file.name}`
							);
						} else {
							this.flatRepos[key].add(file.name);
						}
					});
				} else {
					outputFileTree.children.push({
						name: key,
						children: files.map((file) => {
							return {
								name: file.name
							};
						})
					});
				}
			}

			return;
		}

		if (!this.options.flat) {
			await Promise.all(
				Object.keys(dirMapping).map((newFolder) => {
					const newPath = path.join(dir.root, newFolder);
					return this.createNewDirectory(newPath);
				})
			);
		}
		for (const key in dirMapping) {
			const files = dirMapping[key];
			await Promise.all(
				files.map(async ({ name, parentPath }) => {
					const src = path.join(parentPath, name);

					const dest = path.join(
						this.options.flat ? this._rootDir : parentPath,
						key,
						name
					);

					const isExist = await this.isFileExisting(dest);

					if (isExist) {
						await asyncFS.rename(
							src,
							path.join(
								this.options.flat ? this._rootDir : parentPath,
								key,
								String(Date.now()) + '-' + name
							)
						);
					} else {
						await asyncFS.rename(src, dest);
					}
				})
			);
		}
	}

	isFileExcludedFromSearch(fileName: string) {
		let isExcluded: boolean = fileName.startsWith('.');

		if (this.options.exclude) {
			const regex = new RegExp(this.options.exclude);
			isExcluded = isExcluded || regex.test(fileName);
		}

		return isExcluded;
	}

	getDirectoryName(directory: string) {
		return directory.split('/').pop();
	}

	async getFilesInDirectory(directory: string) {
		const newOutputFileTree = {
			name: this.getDirectoryName(directory),
			children: []
		};

		// 1. List out all files in current directory
		const files = await asyncFS.readdir(directory, { withFileTypes: true });

		const result = {
			root: path.resolve(directory),
			file: [],
			dir: []
		};

		// 2. Store files and directories in the result object
		for (const file of files) {
			if (!this.isFileExcludedFromSearch(file.name)) {
				const fileNum = file[Object.getOwnPropertySymbols(file)[0]];
				const validEnum = Object.keys(READ_TYPES).includes(
					String(fileNum)
				);
				if (!validEnum) return;

				const type = READ_TYPES[fileNum];
				if (type === READ_TYPES[3]) continue;
				result[type].push({ name: file.name, parentPath: directory });
			}
		}

		// 3. Sort files and directories
		await this.sortFilesInDirectory(result, newOutputFileTree);

		// 4. Recursively get files and directories in subdirectories
		if (this.options.recursive) {
			for (const dr of result.dir) {
				if (
					!this.excludedRegex.test(dr.name) &&
					!this.excluded.folders.has(dr.name)
				) {
					const outputFileTree = await this.getFilesInDirectory(
						path.join(dr.parentPath, dr.name)
					);
					newOutputFileTree.children.push(outputFileTree);
				}
			}
		}

		return newOutputFileTree;
	}

	async setFlat(flatMap = false) {
		this.options.flat = flatMap;

		if (flatMap) {
			const dirs = [
				...this.options.config.default.map(({ name }) => name),
				this.options.config?.extra?.name || 'miscellaneous'
			];

			await Promise.all(
				dirs.map((dirname) => {
					const dirName = this.prefix + '_' + dirname;
					const newPath = path.join(this._rootDir, dirName);
					this.flatRepos[dirName] = new Set<string>();
					return this.createNewDirectory(newPath);
				})
			);
		}

		return this.options.flat;
	}

	async organize() {
		// process current directory
		// recursively call organize on subdirectories
		info('Organizing files...');
		const outputFileTree = await this.getFilesInDirectory(this._rootDir);
		if (this.options.flat) {
			const flatTree = Object.keys(this.flatRepos).map((key) => {
				return {
					name: key,
					children: [...this.flatRepos[key]].map((name) => {
						return {
							name,
							children: []
						};
					})
				};
			});
			outputFileTree.children = [...flatTree, ...outputFileTree.children];
		}
		info(tree.getStringTree([outputFileTree]));

		if (!this.options.dryRun) {
			info('Files organized successfully');
		}
	}
}
