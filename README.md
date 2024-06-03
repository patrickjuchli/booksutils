# Books Utils

Provides utility scripts for Apple Books, for example exporting highlights.

## Requirements

Deno, install using `brew install deno`. For alternatives, see https://docs.deno.com/runtime/manual/getting_started/installation.

## List books

Lists all books you have in your Apple Books Library.

`./books.ts list [optional partial title]`

Example: `./books.ts list mythical`

## Export highlights

Logs all highlights and their annotations of a given book. Highlights are ordered by appearance in the book.

`./books.ts highlights [required book identifier]`

Example: `./books.ts highlights 3DCFFA1265789220CB15DCA1B7F438BF > highlights.md`

