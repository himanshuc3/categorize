/**
 * Categorize - A CLI tool for automatically organizing files into categorized folders
 *
 * This is the main entry point for the application that implements a file organization
 * system. It categorizes files based on their extensions into predefined or custom
 * folder structures.
 *
 * Architecture:
 * - index.ts     - Entry point, initializes the application
 * - controller.ts - Handles CLI argument parsing and orchestrates the process
 * - reader/index.ts - Contains the core logic for file categorization and organization
 *
 * Flow:
 * 1. Parse command-line arguments (directory, recursive, etc.)
 * 2. Initialize a Reader instance with the parsed options
 * 3. Execute the file organization process
 *
 * Environment Compatibility:
 * - Runs as a CommonJS module for maximum compatibility
 * - Can be executed directly as a CLI tool when properly built
 */

// TODO: After countless efforts and time drain,
// had to switch to cjs, because esm and ts-node is
// a bitch.

// NOTE:
// 1. Nodejs - Good for i/o bound tasks
// 2. Anecdotes make it revolve around servers in node rather
// than server side scripting

'use strict';

import Controller from './helper/controller';
const debug = require('debug');

/**
 * Main application function that orchestrates the file organization process.
 */
async function main() {
	// Initialize the controller which parses CLI arguments and manages the process
	const controller = new Controller();

	// Parse arguments from the command line into a structured CLIArguments object
	controller.parseArguments();

	// Configure the Reader with the parsed options (directory, recursive, etc.)
	await controller.setReaderOptions();

	// Execute the file organization process
	await controller.initiateSegregation();
}

// Execute the application
main();
