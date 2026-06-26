const DB_NAME = "chalk-db";
const STORE_NAME = "notes";
const DB_VERSION = 1;

/**
 * Extract hashtags from note content.
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
 * Open IndexedDB
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            const store = db.createObjectStore(STORE_NAME, {
                keyPath: "note_id"
            });

            store.createIndex(
                "note_updated_at",
                "note_updated_at"
            );

            store.createIndex(
                "note_created_at",
                "note_created_at"
            );

            // Multi-entry means every tag gets indexed individually.
            store.createIndex(
                "note_tags",
                "note_tags",
                { multiEntry: true }
            );
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get every tag along with the number of notes using it.
 *
 * Returns:
 * [
 *   { tag: "react", count: 12 },
 *   { tag: "todo", count: 8 },
 *   { tag: "inbox", count: 3 }
 * ]
 */
export async function getAllTags() {
    const notes = await getAllNotes();

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
 * Get all notes.
 */
export async function getAllNotes(sort = "updated-desc") {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const request = store.getAll();

        request.onsuccess = () => {
            const notes = request.result || [];

            notes.sort((a, b) => {
                switch (sort) {
                    case "updated-asc":
                        return a.note_updated_at - b.note_updated_at;

                    case "created-asc":
                        return a.note_created_at - b.note_created_at;

                    case "created-desc":
                        return b.note_created_at - a.note_created_at;

                    case "updated-desc":
                    default:
                        return b.note_updated_at - a.note_updated_at;
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
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const request = store.get(note_id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get all notes with a given tag.
 * Pass either "react" or "#react".
 */
export async function getNotesByTag(tag, sort = "created-desc") {
    const db = await openDB();

    tag = tag.replace(/^#/, "").toLowerCase();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

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
    const db = await openDB();

    const now = Date.now();

    const content = data.note_content ?? "";

    const note = {
        note_id: crypto.randomUUID(),

        note_content: content,

        note_tags: extractTags(content),

        note_created_at: now,
        note_updated_at: now
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const request = store.add(note);

        request.onsuccess = () => resolve(note);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Update note.
 */
export async function updateNote(note_id, data = {}) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const getRequest = store.get(note_id);

        getRequest.onsuccess = () => {
            const existing = getRequest.result;

            if (!existing) {
                reject(new Error("Note not found."));
                return;
            }

            const content =
                data.note_content ?? existing.note_content;

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
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const request = store.delete(note_id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete every note.
 */
export async function deleteAllNotes() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Export entire database to JSON.
 *
 * Returns a plain object:
 * {
 *   version,
 *   exported_at,
 *   notes: [...]
 * }
 */
export async function exportData() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const request = store.getAll();

        request.onsuccess = () => {
            const notes = request.result || [];

            resolve({
                version: DB_VERSION,
                exported_at: Date.now(),
                notes
            });
        };

        request.onerror = () => reject(request.error);
    });
}

/**
 * Import database from JSON.
 *
 * data format:
 * {
 *   notes: [...],
 *   version?: number
 * }
 *
 * mode:
 * - "replace" (default) → clears DB first
 * - "merge" → upserts notes
 */
export async function importData(data, mode = "replace") {
    const db = await openDB();

    if (!data?.notes || !Array.isArray(data.notes)) {
        throw new Error("Invalid import format");
    }

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        if (mode === "replace") {
            store.clear();
        }

        for (const note of data.notes) {
            const normalized = {
                ...note,
                // safety: ensure tags are correct
                note_tags: extractTags(note.note_content || ""),
            };

            store.put(normalized);
        }

        tx.oncomplete = () => {
            resolve({
                imported: data.notes.length,
                mode
            });
        };

        tx.onerror = () => reject(tx.error);
    });
}