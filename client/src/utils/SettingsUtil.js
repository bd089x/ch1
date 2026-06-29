/**
 * SettingsUtil.js
 *
 * localStorage-backed app settings with versioned schema.
 */

const STORAGE_KEY = "app_settings";
const SETTINGS_VERSION = 1;

/**
 * Default settings structure
 */
const DEFAULT_SETTINGS = {
    version: SETTINGS_VERSION,

    home: {
        workspace_sort: "created-desc",
        workspace_recent: []
    },

    editor: {},

    appearance: {}
};

/**
 * Read raw settings from localStorage
 */
function readRawSettings() {

    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) return {};

        return JSON.parse(stored);

    } catch (err) {
        console.warn("Failed to parse settings:", err);
        return {};
    }

}

/**
 * Write settings to localStorage
 */
function writeSettings(settings) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
    );
}

/**
 * Deep merge for known structure
 */
function mergeSettings(stored) {

    return {
        ...DEFAULT_SETTINGS,

        ...stored,

        version: SETTINGS_VERSION,

        home: {
            ...DEFAULT_SETTINGS.home,
            ...(stored.home || {})
        },

        editor: {
            ...DEFAULT_SETTINGS.editor,
            ...(stored.editor || {})
        },

        appearance: {
            ...DEFAULT_SETTINGS.appearance,
            ...(stored.appearance || {})
        }
    };
}

/**
 * Get full settings object
 */
export function getSettings() {
    const stored = readRawSettings();
    return mergeSettings(stored);
}

/**
 * Save full settings object
 */
export function saveSettings(settings) {
    writeSettings(settings);
}

/**
 * HOME SETTINGS
 */
export function getHomeSettings() {
    return getSettings().home;
}

export function saveHomeSettings(homeSettings) {

    const settings = getSettings();

    settings.home = {
        ...settings.home,
        ...homeSettings
    };

    writeSettings(settings);
}

/**
 * RECENT WORKSPACES (domain helper)
 */
export function addRecentWorkspace(workspaceId, limit = 10) {

    const home = getHomeSettings();

    const updated = [
        workspaceId,
        ...home.workspace_recent.filter(
            id => id !== workspaceId
        )
    ].slice(0, limit);

    saveHomeSettings({
        ...home,
        workspace_recent: updated
    });

}

export function removeRecentWorkspace(workspaceId) {

    const home = getHomeSettings();

    saveHomeSettings({
        ...home,
        workspace_recent: home.workspace_recent.filter(
            id => id !== workspaceId
        )
    });

}

export function clearRecentWorkspaces() {

    saveHomeSettings({
        ...getHomeSettings(),
        workspace_recent: []
    });

}

/**
 * SIMPLE GETTER HELPERS
 */
export function getWorkspaceSort() {
    return getHomeSettings().workspace_sort;
}

export function setWorkspaceSort(sort) {
    saveHomeSettings({
        ...getHomeSettings(),
        workspace_sort: sort
    });
}

/**
 * Normalize imported settings safely.
 *
 * Ensures:
 * - required structure exists
 * - missing fields are filled with defaults
 * - version is always valid
 */
export function normalizeImportedSettings(settings = {}) {

    return {
        version: settings.version || 1,

        home: {
            workspace_sort: "created-desc",
            workspace_recent: [],
            ...(settings.home || {})
        },

        editor: {
            ...(settings.editor || {})
        },

        appearance: {
            ...(settings.appearance || {})
        }
    };

}