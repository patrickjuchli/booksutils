/**
 * EPUB Canonical Fragment Identifiers
 * 
 * Spec: https://idpf.org/epub/linking/cfi/
 *
 */

import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const PADDING_SIZE = 6
const REGEX_SQUARE_BRACKET_EXPR = /\[.*\]!?/g

/**
 * Converts CFI start location to comparable string that can be used for sorting. You can either provide `epubcfi(loc)` or
 * `epubcfi(parent,start,end)`. The result can only be used for fast comparisons, it's not meant to convey any other information.
 * 
 * For example, from `epubcfi(/6/24[ch011_xhtml]!/4/320/3,:571,:651)` you'll get `000060002400004003200000300571`, a string
 * that you can use to compare locations in a sorting function.
 */
export function cfiGetSortableStartLocation(cfi: string): string {
    const numerical = cfi.replaceAll(REGEX_SQUARE_BRACKET_EXPR, "")
    const parts = numerical.split(",") // See https://idpf.org/epub/linking/cfi/#sec-ranges
    const parentAndStart = parts[0] + (parts[1] ?? "") 
    const matches = parentAndStart.match(/\d+/g)
    if (matches === null) {
        return ""
    }
    // Padding each value in a CFI range start location will make the resulting strings comparable/sortable.
    // It's assumed that a padding of PADDING_SIZE "oughta be enough for everyone". This assumption might break.
    return matches.map(m => m.padStart(PADDING_SIZE, "0")).join("")
}

Deno.test("cfiGetSortableStartLocation parent+start+end", () => {
    const expected = "000006000024000004000320000003000571"
    const actual = cfiGetSortableStartLocation("epubcfi(/6/24[ch011_xhtml]!/4/320/3,:571,:651)")
    assertEquals(actual, expected)
});

Deno.test("cfiGetSortableStartLocation just location, no range", () => {
    const expected = "000006000024000004000320000003000571"
    const actual = cfiGetSortableStartLocation("epubcfi(/6/24[ch011_xhtml]!/4/320/3:571")
    assertEquals(actual, expected)
});