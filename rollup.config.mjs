import fs from 'node:fs/promises';
import path from 'node:path';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const rawPackageJSON = await fs.readFile('package.json', { encoding: 'utf8' });

/** @type {import('./package.json')} */
const { name, version, main } = JSON.parse(rawPackageJSON);

const libOutputPath = main.replace(/\.[cm]?js$/, '');

// Only built-ins that are definitely used by the app
const onlyExclude = ['fs', 'path', 'os', 'util'];

export default {
	input: 'src/index.ts',
	output: {
		file: libOutputPath + '.cjs',
		format: 'cjs',
		banner: '#!/usr/bin/env node',
		sourcemap: false,
		// Ensure dependencies are included
		inlineDynamicImports: true
	},
	// ONLY exclude the absolute minimum Node.js built-ins
	external: onlyExclude,
	plugins: [
		nodeResolve({
			preferBuiltins: true,
			// Include all dependencies, regardless of where they are
			resolveOnly: (module) => {
				return (
					!onlyExclude.includes(module) && !module.startsWith('node:')
				);
			}
		}),
		commonjs({
			// These options help with problematic CommonJS modules
			ignoreTryCatch: true,
			ignoreDynamicRequires: false,
			transformMixedEsModules: true,
			// Ensures modules can find their nested dependencies
			extensions: ['.js', '.cjs', '.json'],
			ignore: onlyExclude
		}),
		json(),
		esbuild({
			target: 'node16',
			minify: false,
			sourceMap: false
		})
	]
};
