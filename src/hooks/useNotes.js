const STORAGE_KEY = "chalk-notes";

/**
 * Load notes
 */
function loadNotes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

/**
 * Save notes
 */
function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

/**
 * Get all notes
 */
export function getAllNotes() {
    return loadNotes();
}

/**
 * Get single note
 */
export function getNote(id) {
    const notes = loadNotes();
    return notes.find(n => n.id === Number(id));
}

/**
 * Create note (schema-based)
 */
export function createNote() {
    const notes = loadNotes();

    const now = Date.now();

    const newNote = {
        id: now,
        title: "Untitled",
        content: "",

        createdAt: now,
        updatedAt: now
    };

    notes.unshift(newNote);
    saveNotes(notes);

    return newNote;
}

/**
 * Update note (schema-safe merge)
 */
export function updateNote(id, data) {
    const notes = loadNotes();

    const updated = notes.map(note => {
        if (note.id !== Number(id)) return note;

        return {
            ...note,
            ...data,
            updatedAt: Date.now()
        };
    });

    saveNotes(updated);
}