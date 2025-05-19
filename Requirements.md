# Categorize

## v0.1

1. Sorting and categorizing files based on extensions
    - only current directory (done)
    - recursively from the given src directory (avoiding collisions) (done)
    - in a flat structure (-f without -r is default execution) (done)
2. [Non Functional] Focus on logging
    - Useful logs for discovering how cli works
    - Useful error traces
    - Colorful output helping in debug statements.
3. Users can exclude certain files to be left untouched as they could be large in size or
4. Dry run mode - preview the output tree structure without making any changes (read-only mode).
5. [Non functional] CI pipeline
    - Two stage: Build binary & test on linux env

## v0.2

1. Support undo for the last categorize operation (each operation is atomic).
2. Support config driven categorization where users can define their own rules for sorting.
3. Creation Date based organization (--group-by flag) (2024/ -> april, may, june | 2025/ -> april, may, june).
4. Can be run as a cron job (though it could be an unsafe operation giving an application os access for such critical tasks).
5. Duplicate Detection: Remove duplicates based on content hash of files
6. Parallel processing of directories
7. [Non functional] Refactor w/ better node patterns for better separation of concerns
8. Making the categorization interactive by confirming the initial file structure.
9. Make it read first by default (make dry run default and a flag to execute)
10. Handling extensions with casing (pdf and PDF).
11. Handle more efficient and color coded version of output file structure (object-treeify, flexible-tree-printer, tree-cli, tree-dump etc.)
12. Add unit and E2E testing for robustness. Since it works on file-system, E2E tests in different scenarios and desktop environments are necessary to ensure cli works as expected.
