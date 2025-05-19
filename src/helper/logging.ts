// NOTE:
// 1. POSIX is how C style programs interface w/ linux
// 2. JS doesn't expose IO but only the core language features
// & depends on adapting to the environment
// 3. /dev/null is a bit trash can, a void perhaps
// 4. #!usr/bin/env node - put this at the top of the file and
// it commands to use node to interpret the program
// 5. chmod u+x filename - change file permissions to make it executable
// 6. Nodejs cb handlers usually take 2 args: err & data
// 7. process.stdin is a readable stream  [- is a convention to process stdinput]
// 8. Processing env - BASE_URL="https://example.com" node src/helper/logging.js - process.env.BASE_URL
// 9. Readable and writable streams are the two main types of streams (readable streams are used to read data from a source, while writable streams are used to write data to a destination)
// 10. zlib - for gzip compression (works for streams of data)
// 11. CAF - for generating cancellation token
// 12. Sqlite3 - for database operations, no need of running a server
// 13. util.promisify - for converting callback functions to promises
process.stdout.write('How does it output to stdout?');
console.log('How does it output to stdout?');
// process.stdin.in
