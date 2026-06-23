const DB_NAME = "chalk-db";
const STORE_NAME = "notes";
const DB_VERSION = 1;

/**
 * Open DB (singleton)
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: "note_id"
                });

                store.createIndex("note_updated_at", "note_updated_at");
                store.createIndex("note_title", "note_title");
                store.createIndex("note_created_at", "note_created_at");
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * GET ALL NOTES (WITH SORTING OPTIONS)
 */
export async function getAllNotes(sort = "updated-desc") {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const request = store.getAll();

        request.onsuccess = () => {
            const data = request.result || [];

            const sorted = [...data].sort((a, b) => {
                switch (sort) {
                    case "updated-asc":
                        return (a.note_updated_at || 0) - (b.note_updated_at || 0);

                    case "updated-desc":
                        return (b.note_updated_at || 0) - (a.note_updated_at || 0);

                    case "title-asc":
                        return (a.note_title || "").localeCompare(b.note_title || "");

                    case "title-desc":
                        return (b.note_title || "").localeCompare(a.note_title || "");

                    default:
                        return (b.note_updated_at || 0) - (a.note_updated_at || 0);
                }
            });

            resolve(sorted);
        };

        request.onerror = () => reject(request.error);
    });
}

/**
 * GET ONE NOTE
 */
export async function getNote(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * CREATE NOTE (single source of truth)
 */
export async function createNote(data = {}) {
    const db = await openDB();

    const now = Date.now();

    const newNote = {
        note_id: crypto.randomUUID(),

        note_title: data.note_title ?? "Untitled",
        note_content: data.note_content ?? "",

        note_created_at: now,
        note_updated_at: now
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const request = store.add(newNote);

        request.onsuccess = () => resolve(newNote);
        request.onerror = () => reject(request.error);
    });
}

/**
 * UPDATE NOTE
 */
export async function updateNote(id, data) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const getReq = store.get(id);

        getReq.onsuccess = () => {
            const existing = getReq.result;

            if (!existing) {
                reject("Note not found");
                return;
            }

            const updated = {
                ...existing,

                note_title:
                    data.note_title ?? existing.note_title,

                note_content:
                    data.note_content ?? existing.note_content,

                note_updated_at: Date.now()
            };

            const putReq = store.put(updated);

            putReq.onsuccess = () => resolve(updated);
            putReq.onerror = () => reject(putReq.error);
        };

        getReq.onerror = () => reject(getReq.error);
    });
}

/**
 * DELETE NOTE
 */
export async function deleteNote(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

/**
 * DELETE ALL NOTES
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