import {
    getStore,
    WORKSPACE_STORE
} from "../models/db";

/**
 * Normalize workspace tags.
 */
function normalizeTags(tags = []) {
    return [
        ...new Set(
            tags
                .map(tag =>
                    tag
                        .replace(/^#/, "")
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean)
        )
    ];
}

/**
 * Get every saved workspace.
 *
 * Returns:
 * [
 *   {
 *     workspace_id: "...",
 *     workspace_title: "Notes",
 *     workspace_tags: ["notes", "thoughts"],
 *     workspace_created_at: 123456,
 *     workspace_updated_at: 123456
 *   }
 * ]
 */

 /**
 * Get all workspaces.
 * (sorted by creation date or name)
 */
export async function getAllWorkspaces(sort = "created-desc") {

    const { store } = await getStore(
        WORKSPACE_STORE,
        "readonly"
    );

    return new Promise((resolve, reject) => {

        const request = store.getAll();

        request.onsuccess = () => {
            const workspaces = request.result || [];

            workspaces.sort((a, b) => {

                switch (sort) {

                    case "created-asc":
                        return (a.workspace_created_at || 0) - (b.workspace_created_at || 0);

                    case "created-desc":
                        return (b.workspace_created_at || 0) - (a.workspace_created_at || 0);

                    case "title-asc":
                        return (a.workspace_title || "").localeCompare(b.workspace_title || "");

                    case "title-desc":
                        return (b.workspace_title || "").localeCompare(a.workspace_title || "");

                    default:
                        return (b.workspace_created_at || 0) - (a.workspace_created_at || 0);

                }

            });

            resolve(workspaces);
        };

        request.onerror = () => {
            reject(request.error);
        };

    });
}

/**
 * Get one workspace.
 */
export async function getWorkspace(id) {

    const { store } = await getStore(
        WORKSPACE_STORE,
        "readonly"
    );

    return new Promise((resolve, reject) => {

        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };

    });
}

/**
 * Create a workspace.
 */
export async function createWorkspace({
    name,
    tags = []
} = {}) {

    const { store } = await getStore(
        WORKSPACE_STORE,
        "readwrite"
    );

    const now = Date.now();

    const workspace = {
        workspace_id: crypto.randomUUID(),

        workspace_title: (name || "Untitled").trim(),

        workspace_tags: normalizeTags(tags),

        workspace_created_at: now,
        workspace_updated_at: now
    };

    return new Promise((resolve, reject) => {

        const request = store.add(workspace);

        request.onsuccess = () => resolve(workspace);

        request.onerror = () => reject(request.error);

    });
}

/**
 * Update a workspace.
 */
export async function updateWorkspace(id, data = {}) {

    const { store } = await getStore(
        WORKSPACE_STORE,
        "readwrite"
    );

    return new Promise((resolve, reject) => {

        const getRequest = store.get(id);

        getRequest.onsuccess = () => {

            const existing = getRequest.result;

            if (!existing) {
                reject(new Error("Workspace not found."));
                return;
            }

            const updated = {
                ...existing,

                ...(data.name !== undefined && {
                    workspace_title: data.name.trim()
                }),

                ...(data.tags !== undefined && {
                    workspace_tags: normalizeTags(data.tags)
                }),

                workspace_updated_at: Date.now()
            };

            const putRequest = store.put(updated);

            putRequest.onsuccess = () => resolve(updated);

            putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
    });
}

/**
 * Delete a workspace.
 */
export async function deleteWorkspace(id) {

    const { store } = await getStore(
        WORKSPACE_STORE,
        "readwrite"
    );

    return new Promise((resolve, reject) => {

        const request = store.delete(id);

        request.onsuccess = () => resolve(true);

        request.onerror = () => reject(request.error);

    });
}

/**
 * Remove every saved workspace.
 */
export async function deleteAllWorkspaces() {

    const { store } = await getStore(
        WORKSPACE_STORE,
        "readwrite"
    );

    return new Promise((resolve, reject) => {

        const request = store.clear();

        request.onsuccess = () => resolve(true);

        request.onerror = () => reject(request.error);

    });
}