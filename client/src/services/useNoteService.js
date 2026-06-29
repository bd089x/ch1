import {
    getStore,
    NOTE_STORE
} from "../models/Db";

import {
    buildNote,
    countTags,
    sortNotes,
    updateNoteRecord,
    restoreNoteRecord
} from "../domains/NotesDomain";

import {
    normalizeTag
} from "../utils/NormalizeTagUtil.js";

/**
 * Get every tag along with the number of notes using it.
 */
export async function getAllTags() {

    const notes = await getAllNotes();

    return countTags(notes);
}

/**
 * Get all notes.
 */
export async function getAllNotes(sort = "created-desc") {

    const { store } = await getStore(
        NOTE_STORE,
        "readonly"
    );

    return new Promise((resolve, reject) => {

        const request = store.getAll();

        request.onsuccess = () => {

            resolve(
                sortNotes(
                    request.result || [],
                    sort
                )
            );

        };

        request.onerror = () =>
            reject(request.error);

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

    const normalizedTag = normalizeTag(tag);

    return new Promise((resolve, reject) => {

        const index = store.index("note_tags");

        const request = index.getAll(normalizedTag);

        request.onsuccess = () => {

            resolve(
                sortNotes(
                    request.result || [],
                    sort
                )
            );

        };

        request.onerror = () =>
            reject(request.error);

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

    const note = buildNote(data);

    return new Promise((resolve, reject) => {

        const request = store.add(note);

        request.onsuccess = () =>
            resolve(note);

        request.onerror = () =>
            reject(request.error);

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

            const updated = updateNoteRecord(
                existing,
                data
            );

            const putRequest = store.put(updated);

            putRequest.onsuccess = () =>
                resolve(updated);

            putRequest.onerror = () =>
                reject(putRequest.error);

        };

        getRequest.onerror = () =>
            reject(getRequest.error);

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

        request.onsuccess = () =>
            resolve(true);

        request.onerror = () =>
            reject(request.error);

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

        request.onsuccess = () =>
            resolve(true);

        request.onerror = () =>
            reject(request.error);

    });
}

/**
 * Restore note (used for import/export or syncing).
 *
 * Unlike createNote:
 * - preserves note_id
 * - preserves timestamps
 * - does NOT re-generate tags or content structure
 */
export async function restoreNote(data = {}) {

    const { store } = await getStore(
        NOTE_STORE,
        "readwrite"
    );

    const note = restoreNoteRecord(data);

    return new Promise((resolve, reject) => {

        const request = store.put(note);

        request.onsuccess = () =>
            resolve(note);

        request.onerror = () =>
            reject(request.error);

    });

}