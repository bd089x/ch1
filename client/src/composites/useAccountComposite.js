import * as noteService from "../services/useNoteService";
import * as workspaceService from "../services/useWorkspaceService";

import {
    getSettings,
    saveSettings,
    normalizeImportedSettings
} from "../utils/SettingsUtil";

/**
 * Full account export.
 *
 * Shape:
 * {
 *   version: 1,
 *   exported_at: number,
 *   notes: [...],
 *   workspaces: [...],
 *   settings: {...}
 * }
 */
export async function exportAccount() {

    const [notes, workspaces] = await Promise.all([
        noteService.getAllNotes(),
        workspaceService.getAllWorkspaces()
    ]);

    const settings = getSettings();

    return {
        version: 1,
        exported_at: Date.now(),

        notes: notes || [],
        workspaces: workspaces || [],
        settings
    };
}

/**
 * Full account import.
 *
 * ALWAYS "replace" mode:
 * - wipes existing data
 * - restores full snapshot cleanly
 */
export async function importAccount(data) {

    if (!data || typeof data !== "object") {
        throw new Error("Invalid import format");
    }

    const notes = Array.isArray(data.notes) ? data.notes : [];
    const workspaces = Array.isArray(data.workspaces) ? data.workspaces : [];
    const settings = data.settings;

    const results = {
        notes: null,
        workspaces: null,
        settings: null
    };

    /**
     * STEP 1 — WIPE EVERYTHING
     */
    await Promise.all([
        noteService.deleteAllNotes(),
        workspaceService.deleteAllWorkspaces()
    ]);

    /**
     * STEP 2 — RESTORE WORKSPACES
     */
    let workspaceCount = 0;

    for (const ws of workspaces) {

        await workspaceService.restoreWorkspace(ws);
        workspaceCount++;

    }

    results.workspaces = {
        imported: workspaceCount
    };

    /**
     * STEP 3 — RESTORE NOTES
     */
    let noteCount = 0;

    for (const note of notes) {

        await noteService.restoreNote(note);
        noteCount++;

    }

    results.notes = {
        imported: noteCount
    };

    /**
     * STEP 4 — RESTORE SETTINGS
     */
    if (settings && typeof settings === "object") {

        saveSettings(normalizeImportedSettings(settings));

        results.settings = {
            imported: true
        };

    } else {

        results.settings = {
            imported: false,
            reason: "missing"
        };

    }

    return {
        imported_at: Date.now(),
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

    // reset settings too
    saveSettings({
        version: 1,
        home: {
            workspace_sort: "created-desc",
            workspace_recent: []
        },
        editor: {},
        appearance: {}
    });

    return {
        reset_at: Date.now(),
        success: true
    };
}