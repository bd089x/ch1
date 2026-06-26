const DB_NAME = "chalk-db";
const DB_VERSION = 1;

export const NOTE_STORE = "notes";
export const WORKSPACE_STORE = "workspaces";

/**
 * Open the Chalk IndexedDB database.
 */
export function openDB() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = (event) => {

            const db = event.target.result;

            /**
             * Notes
             */
            if (!db.objectStoreNames.contains(NOTE_STORE)) {

                const notes = db.createObjectStore(
                    NOTE_STORE,
                    {
                        keyPath: "note_id"
                    }
                );

                notes.createIndex(
                    "note_created_at",
                    "note_created_at"
                );

                notes.createIndex(
                    "note_updated_at",
                    "note_updated_at"
                );

                notes.createIndex(
                    "note_tags",
                    "note_tags",
                    {
                        multiEntry: true
                    }
                );

            }

            /**
             * Workspaces
             */
            if (!db.objectStoreNames.contains(WORKSPACE_STORE)) {

                const workspaces = db.createObjectStore(
                    WORKSPACE_STORE,
                    {
                        keyPath: "workspace_id"
                    }
                );

                workspaces.createIndex(
                    "workspace_created_at",
                    "workspace_created_at"
                );

                workspaces.createIndex(
                    "workspace_updated_at",
                    "workspace_updated_at"
                );

                workspaces.createIndex(
                    "workspace_tags",
                    "workspace_tags",
                    {
                        multiEntry: true
                    }
                );

            }

        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };

    });
}

export async function getStore(name, mode = "readonly") {
    const db = await openDB();

    const tx = db.transaction(name, mode);

    return {
        tx,
        store: tx.objectStore(name)
    };
}