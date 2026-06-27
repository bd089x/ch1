import * as noteService from "../services/useNoteService";
import * as workspaceService from "../services/useWorkspaceService";

/**
 * Full account export.
 *
 * Shape:
 * {
 *   version: 1,
 *   exported_at: number,
 *   notes: [...],
 *   workspaces: [...]
 * }
 */
export async function exportAccount() {

    const [notes, workspaces] = await Promise.all([
        noteService.getAllNotes(),
        workspaceService.getAllWorkspaces()
    ]);

    return {
        version: 1,
        exported_at: Date.now(),
        notes: notes || [],
        workspaces: workspaces || []
    };
}

/**
 * Full account import.
 *
 * Expected shape:
 * {
 *   notes: [...],
 *   workspaces: [...],
 *   version?: number
 * }
 *
 * mode:
 * - "replace" → wipe before importing
 * - "merge" → future extension (currently treated same as replace behavior for simplicity)
 */
export async function importAccount(data, mode = "replace") {

    if (!data || typeof data !== "object") {
        throw new Error("Invalid import format");
    }

    const notes = Array.isArray(data.notes) ? data.notes : [];
    const workspaces = Array.isArray(data.workspaces) ? data.workspaces : [];

    const results = {
        notes: null,
        workspaces: null
    };

    // Always start clean for now (merge reserved for future evolution)
    if (mode === "replace") {
        await Promise.all([
            noteService.deleteAllNotes(),
            workspaceService.deleteAllWorkspaces()
        ]);
    }

    /**
     * IMPORT WORKSPACES FIRST
     */
    let workspaceCount = 0;

    for (const ws of workspaces) {

        await workspaceService.createWorkspace({
            name: ws.workspace_title || ws.name || "Untitled",
            tags: ws.workspace_tags || ws.tags || []
        });

        workspaceCount++;
    }

    results.workspaces = {
        imported: workspaceCount,
        mode
    };

    /**
     * IMPORT NOTES SECOND
     */
    let noteCount = 0;

    for (const note of notes) {

        await noteService.createNote({
            note_content: note.note_content || ""
        });

        noteCount++;
    }

    results.notes = {
        imported: noteCount,
        mode
    };

    return {
        imported_at: Date.now(),
        mode,
        results
    };
}

/**
 * Full application wipe.
 */
export async function resetAccount() {

    await Promise.all([
        noteService.deleteAllNotes(),
        workspaceService.deleteAllWorkspaces()
    ]);

    return {
        reset_at: Date.now(),
        success: true
    };
}