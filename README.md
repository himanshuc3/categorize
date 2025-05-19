# Negentropy

A powerful CLI tool for automatically categorizing and organizing files in directories based on their extensions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js: >=16.0.0](https://img.shields.io/badge/Node.js-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
    - [Binary Installation](#1-binary-installation-recommended)
    - [NPM Package Installation](#2-npm-package-installation)
    - [Build from Source](#3-build-from-source)
- [Usage](#usage)
    - [Options](#options)
    - [Examples](#examples)
- [Configuration](#configuration)
- [Getting Started with Development](#getting-started-with-development)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🗃️ Automatically categorize files based on their extensions into organized folders
- 🔄 Recursively process subdirectories
- 🚫 Exclude files or directories using regex patterns
- 📊 Dry run mode tree-based visualization to preview changes before applying them
- 🪄 Flat mode for organizing all files at the root level
- 🌲 Tree visualization of the post organized structure
- ⚙️ (In Progress) Customizable configuration through JSON files

## Installation

There are several ways to install Negentropy depending on your preference:

### 1. Binary Installation (Recommended)

Download the pre-built binary for your operating system from the [Releases](https://github.com/himanshuc3/negentropy/releases) page.

#### Windows

- Download the `negentropy-win-x64.exe` file
- Rename it to `negentropy.exe` (optional)
- Add it to a location in your PATH or run it directly

#### macOS

```bash
# Download the binary
curl -L -o negentropy "https://github.com/himanshuc3/negentropy/releases/latest/download/negentropy-macos-x64"

# Make it executable
chmod +x negentropy

# Move to a directory in your PATH
sudo mv negentropy /usr/local/bin/
```

#### Linux

```bash
# Download the binary
curl -L -o negentropy "https://github.com/himanshuc3/negentropy/releases/latest/download/negentropy-linux-x64"

# Make it executable
chmod +x negentropy

# Move to a directory in your PATH
sudo mv negentropy /usr/local/bin/
```

### 2. NPM Package Installation

Install globally to use as a command-line tool from anywhere:

```bash
# Using npm
npm install -g negentropy

# Or using yarn
yarn global add negentropy

# Or using pnpm
pnpm add -g negentropy
```

### 3. Build from Source

If you want the latest features or need to customize the build:

```bash
# Clone the repository
git clone https://github.com/yourusername/negentropy.git
cd negentropy

# Install dependencies
npm install

# Build the project
npm run build

# Create binaries (optional)
npm run pkg

# The binaries will be available in the 'dist' directory
```

## Usage

```bash
negentropy [options]
```

### Options

| Option | Alias         | Description                                                                                                       | Type    | Default                 |
| ------ | ------------- | ----------------------------------------------------------------------------------------------------------------- | ------- | ----------------------- |
| `-d`   | `--directory` | Directory to organize                                                                                             | string  | Current directory (`.`) |
| `-r`   | `--recursive` | Recursively organize each subdirectory                                                                            | boolean | `false`                 |
| `-e`   | `--exclude`   | Exclude files and directories using regex                                                                         | string  | none                    |
| `-c`   | `--config`    | Path to config file for mapping folders to extensions (not being consumed currently)                              | string  | none                    |
| `-f`   | `--flat`      | Flat map all files to root directory (Use with recursive flag to convert a tree structure to flat directory tree) | boolean | `false`                 |
| `-o`   | `--dryRun`    | Output the final file tree before organizing (no changes made)                                                    | boolean | `false`                 |
| `-h`   | `--help`      | Show help                                                                                                         |         |                         |

### Examples

Basic usage to organize a directory:

```bash
# To organize current files in current directory without recursive iteration
negentropy

# To organize files in a specfic directory relative to the cwd
negentropy -d path/to/directory
```

Recursively organize a directory and all subdirectories:

```bash
negentropy -d path/to/directory -r
```

Perform a dry run to preview changes without making them:

```bash
negentropy -o
```

Exclude files or directories matching a pattern:

```bash
negentropy -e "node_modules|\.git"
```

## Default Configuration

The directories will categorize files according to the default configuration following the format given below. The option for customization will be supported soon via JSON files that can be saved and cached in system settings:

```json
{
	"default": [
		{
			"name": "audio",
			"extensions": ["mp3", "wav", "aac", "wma"]
		},
		{
			"name": "video",
			"extensions": ["mp4", "mov", "avi", "mkv", "flv", "wmv"]
		},
		{
			"name": "documents",
			"extensions": [
				"zip",
				"doc",
				"docx",
				"ppt",
				"xls",
				"html",
				"txt",
				"pdf"
			]
		},
		{
			"name": "executables",
			"extensions": [
				"exe",
				"msi",
				"dmg",
				"pkg",
				"deb",
				"rpm",
				"app",
				"appx",
				"appxbundle",
				"appxupload"
			]
		},
		{
			"name": "images",
			"extensions": [
				"jpg",
				"jpeg",
				"png",
				"svg",
				"gif",
				"ico",
				"webp",
				"heic",
				"heif"
			]
		}
	],
	"prefix": "categorize",
	"extra": {
		"name": "miscellaneous"
	}
}
```

- `prefix`: The prefix to be added to category folder names
- `default`: Array of category objects, each with a name and array of extensions
- `extra`: Configuration for uncategorized files

## Getting Started with Development

### Prerequisites

- Node.js 16.0.0 or higher
- npm, yarn, or pnpm (pnpm is recommended)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/negentropy.git
cd negentropy
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Running Tests

To run the test suite:

```bash
npm run test
```

## Contributing

Contributions are welcome! There's a list of features/enhancements for the next version of the tool present in `Requirements.md` that are up for grabs. Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code follows the existing style and passes all tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
