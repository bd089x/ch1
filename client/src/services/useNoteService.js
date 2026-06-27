import {
    getStore,
    NOTE_STORE
} from "../models/Db";

/**
 * Extract hashtags from note content.
 *
 * Example:
 * "#react #javascript #todo"
 * ->
 * ["react", "javascript", "todo"]
 */
function extractTags(text = "") {
    return [
        ...new Set(
            [...text.matchAll(/#([\w-]+)/g)]
                .map(match => match[1].toLowerCase())
        )
    ];
}

/**
 * Get every tag along with the number of notes using it.
 */
export async function getAllTags() {
    const notes = await getAllNotes();

    const counts = new Map();

    for (const note of notes) {
        for (const tag of note.note_tags || []) {
            counts.set(tag, (counts.get(tag) || 0) + 1);
        }
    }

    return [...counts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            return a.tag.localeCompare(b.tag);
        });
}

/**
 * Get all notes.
 * (sorted only by creation date)
 */
export async function getAllNotes(sort = "created-desc") {

    const { store } = await getStore(
        NOTE_STORE,
        "readonly"
    );

    return new Promise((resolve, reject) => {

        const request = store.getAll();

        request.onsuccess = () => {
            const notes = request.result || [];

            notes.sort((a, b) => {

                switch (sort) {

                    case "created-asc":
                        return (a.note_created_at || 0) - (b.note_created_at || 0);

                    case "created-desc":
                    default:
                        return (b.note_created_at || 0) - (a.note_created_at || 0);

                }

            });

            resolve(notes);
        };

        request.onerror = () => reject(request.error);
    });
}

/**
 * Get one note.
 */
export async function getNote(note_id) {

    const { store } = await getStore(
        NOTE_STORE,
        "readonly"
    );

    return new Promise((resolve, reject) => {

        const request = store.get(note_id);

        request.onsuccess = () =>
            resolve(request.result || null);

        request.onerror = () =>
            reject(request.error);
    });
}

/**
 * Get notes by tag.
 */
export async function getNotesByTag(tag, sort = "created-desc") {

    const { store } = await getStore(
        NOTE_STORE,
        "readonly"
    );

    tag = tag.replace(/^#/, "").toLowerCase();

    return new Promise((resolve, reject) => {

        const index = store.index("note_tags");

        const request = index.getAll(tag);

        request.onsuccess = () => {

            const notes = request.result || [];

            notes.sort((a, b) => {

                switch (sort) {

                    case "created-asc":
                        return (a.note_created_at || 0) - (b.note_created_at || 0);

                    case "created-desc":
                    default:
                        return (b.note_created_at || 0) - (a.note_created_at || 0);
                }
            });

            resolve(notes);
        };

        request.onerror = () => reject(request.error);
    });
}

/**
 * Create note.
 */
export async function createNote(data = {}) {

    const { store } = await getStore(
        NOTE_STORE,
        "readwrite"
    );

    const now = Date.now();

    const note = {
        note_id: crypto.randomUUID(),
        note_content: data.note_content ?? "",
        note_tags: extractTags(data.note_content ?? ""),
        note_created_at: now,
        note_updated_at: now
    };

    return new Promise((resolve, reject) => {

        const request = store.add(note);

        request.onsuccess = () => resolve(note);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Update note.
 */
export async function updateNote(note_id, data = {}) {

    const { store } = await getStore(
        NOTE_STORE,
        "readwrite"
    );

    return new Promise((resolve, reject) => {

        const getRequest = store.get(note_id);

        getRequest.onsuccess = () => {

            const existing = getRequest.result;

            if (!existing) {
                reject(new Error("Note not found."));
                return;
            }

            const content = data.note_content ?? existing.note_content;

            const updated = {
                ...existing,
                note_content: content,
                note_tags: extractTags(content),
                note_updated_at: Date.now()
            };

            const putRequest = store.put(updated);

            putRequest.onsuccess = () => resolve(updated);
            putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
    });
}

/**
 * Delete one note.
 */
export async function deleteNote(note_id) {

    const { store } = await getStore(
        NOTE_STORE,
        "readwrite"
    );

    return new Promise((resolve, reject) => {

        const request = store.delete(note_id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete all notes.
 */
export async function deleteAllNotes() {

    const { store } = await getStore(
        NOTE_STORE,
        "readwrite"
    );

    return new Promise((resolve, reject) => {

        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}