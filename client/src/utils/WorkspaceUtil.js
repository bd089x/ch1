const STORAGE_KEY = "chalk-workspaces";

/**
 * Get every saved workspace.
 *
 * Returns:
 * [
 *   {
 *     id: "...",
 *     name: "Notes",
 *     tags: ["notes", "thoughts"],
 *     created_at: 123456,
 *     updated_at: 123456
 *   }
 * ]
 */
export function getWorkspaces() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch {
        return [];
    }
}

/**
 * Get one workspace.
 */
export function getWorkspace(id) {
    return getWorkspaces().find(
        workspace => workspace.id === id
    ) || null;
}

/**
 * Create a workspace.
 */
export function createWorkspace({
    name,
    tags = []
}) {
    const workspaces = getWorkspaces();
    const now = Date.now();

    const workspace = {
        id: crypto.randomUUID(),

        name: (name || "Untitled").trim(),

        tags: [
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
        ],

        created_at: now,
        updated_at: now
    };

    workspaces.push(workspace);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(workspaces)
    );

    return workspace;
}

/**
 * Update a workspace.
 */
export function updateWorkspace(id, data = {}) {
    const workspaces = getWorkspaces();

    const index = workspaces.findIndex(
        workspace => workspace.id === id
    );

    if (index === -1) {
        throw new Error("Workspace not found.");
    }

    const existing = workspaces[index];

    const updated = {
        ...existing,

        ...(data.name !== undefined && {
            name: data.name.trim()
        }),

        ...(data.tags !== undefined && {
            tags: [
                ...new Set(
                    data.tags
                        .map(tag =>
                            tag
                                .replace(/^#/, "")
                                .trim()
                                .toLowerCase()
                        )
                        .filter(Boolean)
                )
            ]
        }),

        updated_at: Date.now()
    };

    workspaces[index] = updated;

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(workspaces)
    );

    return updated;
}

/**
 * Delete a workspace.
 */
export function deleteWorkspace(id) {
    const workspaces = getWorkspaces().filter(
        workspace => workspace.id !== id
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(workspaces)
    );
}

/**
 * Remove every saved workspace.
 */
export function deleteAllWorkspaces() {
    localStorage.removeItem(STORAGE_KEY);
}