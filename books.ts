/**
 * CLI to access data of the local Apple Books application.
 * 
 * deno run  -A --unstable-ffi books.ts list [partialTitle]
 * deno run  -A --unstable-ffi books.ts highlights [bookId]
 */

import { getBooks, getBookHighlights } from "./lib/AppleBooks.ts";

const cli = {
    list: (partialTitle: string = "") => {
        const books = getBooks(partialTitle)
        console.table(books)
    },
    highlights: (bookId: string) => {
        const results = getBookHighlights(bookId.trim())
        const markdownParts: string[] = []
        for (const result of results) {
            markdownParts.push(`${result.text.trim()}${result.note ? "\n*"+result.note+"*\n":""}`)
        }
        const markdown = markdownParts.join("\n\n")
        console.log(markdown)
    }
}

const action: string = Deno.args[0];
// deno-lint-ignore no-explicit-any
const func = (cli as Record<string, any>)[action];
if (func) {
    func(...Deno.args.slice(1))
} else {
    console.log(`Unknown command '${action}'. Available commands: ${Object.keys(cli).join(", ")}`)
}
