# Categorize

## v0

1. Sorting and categorizing files based on extensions
    - only current directory
    - recursively from the given src directory (avoiding collisions)
    - in a flat structure
2. Making the categorization interactive by confirming the initial file structure.
3. Focus on logging
    - Useful logs for discovering how cli works
    - Useful error traces
    - Colorful output helping in debug statements.
4. Users can exclude certain files because to be left untouched as they could be large in size or 
5. Dry run mode - preview the output tree structure without making any changes (read-only mode).



## v0.1

1. Support undo for the last categorize operation (each operation is atomic).
2. Support config driven categorization where users can define their own rules for sorting.
3. Creation Date based organization (--group-by flag) (2024/ -> april, may, june | 2025/ -> april, may, june).
4. Can be run as a cron job (though it could be an unsafe operation giving an application os access for such critical tasks).
5. Duplicate Detection: Remove duplicates based on content hash of files 
6. Parallel processing of directories