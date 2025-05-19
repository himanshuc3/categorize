/**
 * This module provides file and directory reading functionality for the categorize tool.
 * It handles file organization, directory traversal, and categorization based on file extensions.
 */

// TODO: Promisify later, if helpful for tree shaking
// but since it's a built in, not really necessary.
import asyncFS from 'fs/promises';
import fs from 'fs';
import path from 'path';
import extensions from '../helper/extensions';
import { assertConfigIsValid, flatMapExtensionToFolder } from '../helper/utils';
import { ROOT_DIR, READ_TYPES } from './constants';
import { debugApplication, debugReader, error, info } from '../helper/logger';
import { CLIArguments } from '../types/types';
import tree from 'tree-console';

// Core challenges addressed by this module:
// 1. Resolving clashing directory names
// 2. Fast async of multiple async dir file reads
// 3. Recursive reading of multiple directories

/**
 * DirReader class manages directory reading and file organization operations.
 * It provides methods to traverse directories, categorize files by extension,
 * and organize them into appropriate folders.
 */
export default class DirReader {
	private _rootDir: string; // Root directory to process
	private options: { [key: string]: unknown }; // Configuration options
	private prefix: string; // Prefix for categorized folders
	private flatRepos: { [key: string]: Set<string> }; // Tracks files when in flat mode
	private excluded: { files: Set<string>; folders: Set<string> }; // Files and folders to exclude
	private excludedRegex: RegExp; // Regex pattern for exclusions
	private extensions: { [key: string]: string } = {}; // Mapping of file extensions to folders

	/**
	 * Creates a new DirReader instance.
	 * @param rootDir - The root directory to start reading from (defaults to ROOT_DIR constant)
	 */
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

	/**
	 * Initializes options based on command line arguments.
	 * @param options - CLI arguments to configure the reader
	 */
	async initOptions(options: CLIArguments) {
		this.setRootDirectory(options.directory);
		this.options.recursive = options.recursive || false;
		if (options.config !== 'null') {
			this.setExtensionsConfig(options.config);
		}
		this.options.dryRun = options.dryRun || false;

		if (options.exclude) {
			this.excludedRegex = new RegExp(options.exclude);
		}
		await this.setFlat(options.flat);
	}

	/**
	 * Loads extension configuration from a config file.
	 * @param configPath - Path to the configuration file
	 */
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

	/**
	 * Maps file extensions to their target folders based on configuration.
	 * @param configFile - Configuration object containing extension mappings
	 */
	extensionMap = (configFile?: object) => {
		this.options.config = configFile;
		this.extensions = flatMapExtensionToFolder(configFile || extensions);
	};

	/**
	 * Sets the root directory for file operations.
	 * Validates that the directory exists and is accessible.
	 * @param dir - Directory path (absolute or relative)
	 */
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

	/**
	 * Creates a new directory if it doesn't already exist.
	 * @param newDirectory - Path of the directory to create
	 */
	async createNewDirectory(newDirectory: string) {
		try {
			await asyncFS.access(newDirectory);
		} catch (_err) {
			info(`Directory: ${newDirectory} created`);
			await asyncFS.mkdir(newDirectory);
		}
	}

	/**
	 * Checks if a file exists.
	 * @param file - Path of the file to check
	 * @returns Boolean indicating whether the file exists
	 */
	async isFileExisting(file: string) {
		try {
			await asyncFS.access(file);
			return true;
		} catch (_err) {
			return false;
		}
	}

	/**
	 * Sorts files into appropriate directories based on their extensions.
	 * Handles both dry-run and actual file operations.
	 * @param dir - Directory containing files to sort
	 * @param outputFileTree - Tree structure to store organization information
	 */
	async sortFilesInDirectory(dir, outputFileTree: any) {
		// Group files by their target folder based on extension
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

		// If dry run, just update the file tree without moving files
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

		// Create target directories if needed (non-flat mode)
		if (!this.options.flat) {
			await Promise.all(
				Object.keys(dirMapping).map((newFolder) => {
					const newPath = path.join(dir.root, newFolder);
					return this.createNewDirectory(newPath);
				})
			);
		}

		// Move files to their target directories
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

					// Handle file name collisions by adding timestamp prefix
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

	/**
	 * Determines if a file should be excluded from processing.
	 * @param fileName - Name of the file to check
	 * @returns Boolean indicating whether the file should be excluded
	 */
	isFileExcludedFromSearch(fileName: string): boolean {
		return fileName.startsWith('.') || this.excludedRegex.test(fileName);
	}

	/**
	 * Extracts the directory name from a full path.
	 * @param directory - Full directory path
	 * @returns The name of the directory
	 */
	getDirectoryName(directory: string) {
		return directory.split('/').pop();
	}

	/**
	 * Recursively gets all files and directories in a directory.
	 * @param directory - Directory to scan
	 * @returns A tree structure representing the directory contents
	 */
	async getFilesInDirectory(directory: string) {
		debugReader(directory, 'Reading directory');
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
				if (type === READ_TYPES[3]) continue; // Skip symbolic links
				result[type].push({ name: file.name, parentPath: directory });
			}
		}

		// 3. Sort files and directories
		await this.sortFilesInDirectory(result, newOutputFileTree);

		// 4. Recursively get files and directories in subdirectories
		if (this.options.recursive) {
			for (const dr of result.dir) {
				debugReader(dr.name, 'Checking directory');
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

	/**
	 * Configures flat mode operation for file organization.
	 * When enabled, files are organized in a flat structure at the root.
	 * @param flatMap - Boolean indicating whether to use flat mode
	 * @returns The flat mode setting
	 */
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

	/**
	 * Main method to organize files according to their extensions.
	 * Processes the root directory and optionally subdirectories.
	 * Displays a tree representation of the organization structure.
	 */
	async organize() {
		debugApplication('Organizing Files');
		const outputFileTree = await this.getFilesInDirectory(this._rootDir);

		// Handle flat mode visualization
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

		// Display the tree visualization of organized files
		info(tree.getStringTree([outputFileTree]));

		if (!this.options.dryRun) {
			info('Files organized successfully');
		}
	}
}
