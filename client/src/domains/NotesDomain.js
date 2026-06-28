import { normalizeTag } from "../utils/NormalizeTagUtil.js";

/**
 * Extract hashtags from note content.
 *
 * "#React #react #todo"
 * ->
 * ["react", "todo"]
 */
export function extractTags(text = "") {

    return [
        ...new Set(
            [...text.matchAll(/#([\w-]+)/g)]
                .map(match => normalizeTag(match[1]))
                .filter(Boolean)
        )
    ];
}

/**
 * Sort notes.
 */
export function sortNotes(
    notes = [],
    sort = "created-desc"
) {

    return [...notes].sort((a, b) => {

        switch (sort) {

            case "created-asc":
                return (a.note_created_at || 0) - (b.note_created_at || 0);

            case "created-desc":
            default:
                return (b.note_created_at || 0) - (a.note_created_at || 0);

        }

    });

}

/**
 * Count every tag used across notes.
 */
export function countTags(notes = []) {

    const counts = new Map();

    for (const note of notes) {

        for (const tag of note.note_tags || []) {

            counts.set(
                tag,
                (counts.get(tag) || 0) + 1
            );

        }

    }

    return [...counts.entries()]
        .map(([tag, count]) => ({
            tag,
            count
        }))
        .sort((a, b) => {

            if (b.count !== a.count) {
                return b.count - a.count;
            }

            return a.tag.localeCompare(b.tag);

        });

}

/**
 * Build a brand new note.
 */
export function buildNote(
    data = {},
    {
        now = Date.now(),
        id = crypto.randomUUID()
    } = {}
) {

    return {
        note_id: id,

        note_content: data.note_content ?? "",

        note_tags: extractTags(data.note_content ?? ""),

        note_created_at: now,

        note_updated_at: now
    };

}

/**
 * Build an updated note record.
 */
export function updateNoteRecord(
    existing,
    data = {},
    now = Date.now()
) {

    const content =
        data.note_content ??
        existing.note_content;

    return {

        ...existing,

        note_content: content,

        note_tags: extractTags(content),

        note_updated_at: now

    };

}