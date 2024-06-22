/**
 * Provides access to local information on Apple Books.
 */

import { Database } from "jsr:@db/sqlite@0.11";
import { cfiGetSortableStartLocation } from "./EpubCFI.ts"

const PATH_DIR_HOME = Deno.env.get("HOME")
const PATH_DIR_LIBRARY = `${PATH_DIR_HOME}/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary`
const PATH_DIR_ANNOTATIONS = `${PATH_DIR_HOME}/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation`
const BOOK_ID_MAX_ACCEPTED_LENGTH = 40

export interface Book {
    id: string,
    title: string
}

/**
 * Get all books in the library.
 */
export function getBooks(partialTitle: string = ""): Book[] {
    const dbPath = getSqlitePath(PATH_DIR_LIBRARY)
    const db = new Database(dbPath, { readonly: true });
    const titleFilter = `%${partialTitle}%`
    const results = db.sql`
    SELECT ZASSETID, ZTITLE 
    FROM ZBKLIBRARYASSET
    WHERE ZTITLE LIKE ${titleFilter} 
    ORDER BY ZTITLE`
    db.close()
    return results.map(r => ({
        id: r.ZASSETID,
        title: r.ZTITLE
    }))
}

export interface BookHighlight {
    text: string
    epubcfi: string
    comparableStartLoc: string
    note: string | undefined
}

/**
 * Get all highlights of a book sorted by occurrence.
 */
export function getBookHighlights(bookId: string): BookHighlight[] {
    const dbPath = getSqlitePath(PATH_DIR_ANNOTATIONS)
    const db = new Database(dbPath, { readonly: true });
    const results = db.sql`
    SELECT ZANNOTATIONSELECTEDTEXT, ZANNOTATIONNOTE, ZANNOTATIONLOCATION 
    FROM ZAEANNOTATION 
    WHERE ZANNOTATIONASSETID = ${bookId.slice(0, BOOK_ID_MAX_ACCEPTED_LENGTH)}
      AND ZANNOTATIONSELECTEDTEXT IS NOT NULL 
      AND ZANNOTATIONDELETED=0`
    db.close()
    return results.map(r => ({
        text: r.ZANNOTATIONSELECTEDTEXT,
        epubcfi: r.ZANNOTATIONLOCATION,
        comparableStartLoc: cfiGetSortableStartLocation(r.ZANNOTATIONLOCATION),
        note: r.ZZANNOTATIONNOTE ?? undefined
    })).toSorted(compareHighlightStartLoc)
}

function compareHighlightStartLoc(a: BookHighlight, b: BookHighlight): number {
    if (a.comparableStartLoc < b.comparableStartLoc) return -1
    if (a.comparableStartLoc > b.comparableStartLoc) return 1
    return 0 
}

/**
 * Return the first SQLite database file path in a given directory.
 */
function getSqlitePath(dirPath: string): string {
    for (const e of Deno.readDirSync(dirPath)) {
        if (e.isFile && e.name.endsWith(".sqlite")) {
            return `${dirPath}/${e.name}`
        }
    }
    throw new Error(`No sqlite database found at ${dirPath}`)
}
