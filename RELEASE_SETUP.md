# Setting Up the Release Process

This document explains how to set up the automated release process for reorganize.

## GitHub Actions Workflow

The release workflow is defined in `.github/workflows/release.yaml`. This workflow:

1. Triggers when a tag is pushed that matches the pattern `v*` (e.g., v1.0.0)
2. Builds the project using Rollup
3. Creates binaries for Windows, macOS, and Linux using `pkg`
4. Creates a GitHub Release with the binaries
5. Publishes the package to NPM

## Setting Up NPM Token

For the NPM publishing step to work, you need to create and add an NPM token to your GitHub repository secrets:

1. Log in to your NPM account
2. Go to your account settings
3. Select "Access Tokens" from the sidebar
4. Click "Generate New Token"
5. Choose "Automation" token type
6. Give it a descriptive name (e.g., "GitHub Actions Publishing")
7. Click "Generate Token"
8. Copy the token (you won't be able to see it again)

Then add it to your GitHub repository:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Select "Secrets and variables" → "Actions" from the sidebar
4. Click "New repository secret"
5. Name: `NPM_TOKEN`
6. Value: Paste the NPM token you copied
7. Click "Add secret"

## Creating a Release

To create a new release:

1. Update the version in `package.json`
2. Commit the changes to the main branch
3. Create and push a new tag:

```bash
git tag v1.0.0  # Use the same version as in package.json
git push origin v1.0.0
```

The GitHub Actions workflow will automatically run and create the release.
