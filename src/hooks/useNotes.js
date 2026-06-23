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
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Helper: run transaction
 */
async function tx(mode, fn) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);

        const result = fn(store);

        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
    });
}

/**
 * GET ALL NOTES
 */
export async function getAllNotes() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const request = store.getAll();

        request.onsuccess = () => {
            const data = request.result || [];

            // newest first (same behavior you had)
            data.sort((a, b) => b.updatedAt - a.updatedAt);

            resolve(data);
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

    return new Promise(async (resolve, reject) => {
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