# Categorize

## v0

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

## v0.1

1. Support undo for the last categorize operation (each operation is atomic).
2. Support config driven categorization where users can define their own rules for sorting.
3. Creation Date based organization (--group-by flag) (2024/ -> april, may, june | 2025/ -> april, may, june).
4. Can be run as a cron job (though it could be an unsafe operation giving an application os access for such critical tasks).
5. Duplicate Detection: Remove duplicates based on content hash of files
6. Parallel processing of directories
7. [Non functional] Refactor w/ better node patterns for better separation of concerns

8. Making the categorization interactive by confirming the initial file structure.
