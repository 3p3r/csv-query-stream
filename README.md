# csv-query-stream

Query large compressed CSV documents using NodeJS streams.

## Use Case

```sh
$ npm install csv-query-stream
```

In mission critical applications, sometimes even the extra head space of SQLite
indices can be too much. In that case, data can be saved directly to text files
and queried with this module, while at the same time being inside a Zip archive
and never get unpacked.

This module uses two stream to achieve this:

1. a stream to read the Zip file and seek to the CSV file's position in it
2. a stream to read the CSV file and query inside it

Usage of streams allows low memory overhead and fast processing.

## Data Format

The following assumptions are made about your data when using this module:

- Your data is in CSV or TSV file(s)
- Every row of data is unique in its own file
- Your data file(s) are inside a Zip archive at the root level
- Every row of data is monotonic, meaning row's ID is its line number minus 1
- First row of data is a header row

Sample data is checked in under the `test/` directory.  
API usage is pretty straightforward. See `test/` for examples.
