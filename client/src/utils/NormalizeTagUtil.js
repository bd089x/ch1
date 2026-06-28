/**
 * Normalize a single tag.
 */
export function normalizeTag(tag = "") {

    if (tag == null) return "";

    return String(tag)
        .trim()
        .replace(/^#/, "")
        .toLowerCase();

}