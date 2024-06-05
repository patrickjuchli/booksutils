#!/usr/bin/env -S deno run --allow-read --allow-env --allow-ffi --unstable-ffi

/**
 * CLI to access data of the local Apple Books application.
 */

import { getBooks, getBookHighlights } from "./lib/AppleBooks.ts";
import { cliCommands } from "./lib/CLI.ts";

cliCommands({
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
})
