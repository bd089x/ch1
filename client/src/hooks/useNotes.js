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
                    keyPath: "id"
                });

                store.createIndex("updatedAt", "updatedAt");
                store.createIndex("title", "title");
                store.createIndex("createdAt", "createdAt");
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * GET ALL NOTES (WITH SORTING OPTIONS)
 *
 * sort options:
 * - "updated-desc" (default)
 * - "updated-asc"
 * - "title-asc"
 * - "title-desc"
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
                        return (a.updatedAt || 0) - (b.updatedAt || 0);

                    case "updated-desc":
                        return (b.updatedAt || 0) - (a.updatedAt || 0);

                    case "title-asc":
                        return (a.title || "").localeCompare(b.title || "");

                    case "title-desc":
                        return (b.title || "").localeCompare(a.title || "");

                    default:
                        return (b.updatedAt || 0) - (a.updatedAt || 0);
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

        const request = store.get(Number(id));

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * CREATE NOTE
 */
export async function createNote(data = {}) {
    const db = await openDB();

    const now = Date.now();

    const newNote = {
        id: data.id ?? now,
        title: data.title ?? "Untitled",
        content: data.content ?? "",
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now
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

        const getReq = store.get(Number(id));

        getReq.onsuccess = () => {
            const existing = getReq.result;

            if (!existing) {
                reject("Note not found");
                return;
            }

            const updated = {
                ...existing,
                ...data,
                updatedAt: Date.now()
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

        const request = store.delete(Number(id));

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