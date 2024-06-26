/**
 * EPUB Canonical Fragment Identifiers
 * 
 * Spec: https://idpf.org/epub/linking/cfi/
 */

import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const REGEX_CFI_TAG_EXPR = /\[(\w|\^|\[)*\]+!?/g
const PADDING_SIZE = 6

/**
 * Converts a CFI start location to a string that can be used to quickly compare/sort locations. Accepts either `epubcfi(location)` or
 * a range with `epubcfi(parent,start,end)`.
 * 
 * For example, from `epubcfi(/6/24[ch011_xhtml]!/4/320/3,:571,:651)` you'll get something like `000006000024000004000320000003000571`. 
 * Treat this as an opaque value, use it only for comparing it to other locations, it's not meant to be parsed for other use.
 */
export function cfiGetComparableStartLocation(cfi: string): string {
    const strippedTags = cfi.replaceAll(REGEX_CFI_TAG_EXPR, "")
    const parts = strippedTags.split(",") // See https://idpf.org/epub/linking/cfi/#sec-ranges
    const parentAndStart = parts[0] + (parts[1] ?? "") 
    const numbers = parentAndStart.match(/\d+/g)
    if (numbers === null) {
        return ""
    }
    // Padding each value in a CFI range start location will make the resulting strings comparable/sortable even if 
    // locations have varying numbers of elements. It's assumed that a padding of PADDING_SIZE "oughta be enough for everyone". 
    // This assumption might break.
    return numbers.map(n => n.padStart(PADDING_SIZE, "0")).join("")
}

Deno.test("cfiGetComparableStartLocation parent+start+end", () => {
    const expected = "000006000024000004000320000003000571"
    const actual = cfiGetComparableStartLocation("epubcfi(/6/24[ch011_xhtml]!/4/320/3,:571,:651)")
    assertEquals(actual, expected)
});

Deno.test("cfiGetComparableStartLocation just location, no range", () => {
    const expected = "000006000024000004000320000003000571"
    const actual = cfiGetComparableStartLocation("epubcfi(/6/24[ch011_xhtml]!/4/320/3:571")
    assertEquals(actual, expected)
});

Deno.test("Matching CFI tag expressions", async (t) => {
    interface Test {
        info: string
        input: string
        expected: string
    }
    const tests: Test[] = [{
        info: "No tags",
        input: "epubcfi(/6/14/4/10/2, :2, :5)",
        expected: "epubcfi(/6/14/4/10/2, :2, :5)"
    }, {
        info: "Simple tag",
        input: "epubcfi(/6/24[ch011_xhtml]/4/320/3,:571,:651)",    
        expected: "epubcfi(/6/24/4/320/3,:571,:651)"        
    }, {
        info: "Trailing exclamation mark",
        input: "epubcfi(/6/24[ch011_xhtml]!/4/320/3,:571,:651)",
        expected: "epubcfi(/6/24/4/320/3,:571,:651)"
    }, {
        info: "Multiple tags",
        input: "epubcfi(/6/14[chap05ref]!/4[body01]/10/2)",
        expected: "epubcfi(/6/14/4/10/2)"
    }, {
        info: "Nested tags",
        input: "epubcfi(/6/14[chap05ref]!/4[body01]/10/2/1:3[2^[1^]])",
        expected: "epubcfi(/6/14/4/10/2/1:3)"
    }]
    for (const test of tests) {
        await t.step(test.info, () => {
            const actual = test.input.replaceAll(REGEX_CFI_TAG_EXPR, "")
            assertEquals(actual, test.expected)
        })
    }
})