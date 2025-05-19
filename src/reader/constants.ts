/**
 * Constants used by the directory reader module.
 * This file defines key configuration values used throughout the reader functionality.
 */

/**
 * Default root directory to start reading from if none is specified.
 * Current directory ('.') is used as the default.
 */
export const ROOT_DIR = '.';

/**
 * Type mapping for file system entries.
 * Maps internal Node.js Dirent type numbers to human-readable strings.
 * Used to categorize items found during directory traversal.
 *
 * 1 = regular file
 * 2 = directory
 * 3 = symbolic link (typically skipped during processing)
 */
export const READ_TYPES = {
	1: 'file',
	2: 'dir',
	3: 'link'
};
