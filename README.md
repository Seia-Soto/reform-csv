# reform-csv

Make CSV file to SQL file.

```sh
csv2sql <input file> [output file]
```

## Build standalone

You need to build in specific host because `sqlite3` package binary depends on your system arch.

- Make sure Visual Studio or C++ Compiler installed on your system.
- Make sure Git client is installed on your system.

```sh
yarn build

# or use NPM
npm run build
```

Then you can see the standalone executable and `sqlite3` precompiled binary and the executable.

> You should not change the name of binary file!
