// TODO: Promisify later, if helpful for tree shaking
// but since it's a built in, not really necessary.
import asyncFS from 'fs/promises';
import fs from 'fs';
import path from 'path';
import extensions from '../helper/extensions';
import { assertConfigIsValid, flatMapExtensionToFolder } from '../helper/utils';
import renderText from '../helper/displayText';
import DisplayText from '../helper/displayText';

const ROOT_DIR = 1;

// TODO: Option to avoid soft-links
const readTypes = {
	1: 'file',
	2: 'dir',
	3: 'link'
};

// TODO: Array to set for faster extensions search for each
// value in extension array

// Problems:
// 1. Resolving clashing directory names
// 2. Fast async of multiple async dir file reads
// 3. Recursive reading of multiple directories
export default class DirReader {
	constructor(rootDir = ROOT_DIR) {
		this._rootDir = rootDir;
		this.options = {};
		this.options.config = extensions;
		this.extensionMap();
		this.prefix = extensions.prefix || 'categorize';
		this.excluded = {
			files: new Set('.', '..'),
			folders: new Set([
				...extensions.default.map(({ name }) => name),
				extensions.extra.name
			])
		};
		this.renderText = DisplayText.getInstance();
	}

	async setExtensionsConfig(configPath: string) {
		try {
			const configFile = await asyncFS.readFile(
				path.join(__dirname, configPath)
			);
			assertConfigIsValid(configFile);

			this.extensionMap(configFile);
			this.prefix = configFile.prefix || 'categorize';
			this.excluded.folders = new Set([
				...configFile.default.map(({ name }) => name)
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
				throw new Error(`Absolute Directory: ${dir} does not exist.`);
				return;
			}
			this._rootDir = dir;
		} else if (dir == '.') {
			this._rootDir = __dirname;
		} else {
			const relPath = path.join(__dirname, ...dir.split('/'));
			if (
				!fs.existsSync(relPath) ||
				!fs.lstatSync(relPath).isDirectory()
			) {
				throw new Error(`Directory: ${relPath} does not exist.`);
				return;
			}
			this._rootDir = relPath;
		}
	}

	async createNewDirectory(newDirectory) {
		try {
			await asyncFS.access(newDirectory);
		} catch (_err) {
			await asyncFS.mkdir(newDirectory);
		}
	}

	async sortFilesInDirectory(dir) {
		const dirMapping = dir.file.reduce((acc, file) => {
			const { name, parentPath } = file;
			let extension = name.split('.');
			extension =
				extension.length > 1 ? extension[extension.length - 1] : '';
			const folderName =
				this.prefix +
				'_' +
				(this.extensions[extension] || extensions.extra.name);

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
				files.map(({ name, parentPath }) =>
					asyncFS.rename(
						path.join(parentPath, name),
						path.join(parentPath, key, name)
					)
				)
			);
		}
	}

	async getFilesInDirectory(directory: string, options = {}) {
		const files = await asyncFS.readdir(directory, { withFileTypes: true });
		const result = {
			root: path.resolve(directory),
			file: [],
			dir: []
		};
		for (const file of files) {
			if (file.name.startsWith('.')) continue;
			const fileNum = file[Object.getOwnPropertySymbols(file)[0]];
			const validEnum = Object.keys(readTypes).includes(String(fileNum));
			if (!validEnum) return;

			const type = readTypes[fileNum];
			result[type].push({ name: file.name, parentPath: directory });
		}
		await this.sortFilesInDirectory(result);

		for (const dr of result.dir) {
			if (
				!this.excluded.folders.has(path.join(this.prefix, '_', dr.name))
			) {
				await this.getFilesInDirectory(
					path.join(dr.parentPath, dr.name)
				);
			}
		}

		return files;
	}

	async setFlat(flatMap = false) {
		this.options.flat = flatMap;

		const dirs = [
			...this.config.default.map(({ name }) => name),
			this.config?.extra?.name || 'miscellaneous'
		];

		await Promise.all(
			dirs.map((dirname) => {
				const dirName = this.prefix + '_' + dirname;
				const newPath = path.join(this._rootDir, dirName);
				return this.createNewDirectory(newPath);
			})
		);

		return this.options.flat;
	}

	async organize() {
		// process current directory
		// recursively call organize on subdirectories

		const files = await this.getFilesInDirectory(this._rootDir);
	}
}
