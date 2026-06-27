import * as noteService from "../services/useNoteService";

/**
 * Get every tag along with the number of notes using it.
 */
export async function getAllTags() {
    return noteService.getAllTags();
}

/**
 * Get all notes.
 */
export async function getAllNotes(sort) {
    return noteService.getAllNotes(sort);
}

/**
 * Get one note.
 */
export async function getNote(note_id) {
    return noteService.getNote(note_id);
}

/**
 * Get all notes with a given tag.
 */
export async function getNotesByTag(tag, sort) {
    return noteService.getNotesByTag(tag, sort);
}

/**
 * Create note.
 */
export async function createNote(data) {
    return noteService.createNote(data);
}

/**
 * Update note.
 */
export async function updateNote(note_id, data) {
    return noteService.updateNote(note_id, data);
}

/**
 * Delete one note.
 */
export async function deleteNote(note_id) {
    return noteService.deleteNote(note_id);
}

/**
 * Delete every note.
 */
export async function deleteAllNotes() {
    return noteService.deleteAllNotes();
}