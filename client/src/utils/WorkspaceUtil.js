const STORAGE_KEY = "chalk-workspaces";

/**
 * Get every saved workspace.
 *
 * Returns:
 * [
 *   {
 *     id: "...",
 *     name: "Notes",
 *     tags: ["notes", "thoughts"]
 *   }
 * ]
 */
export function getWorkspaces() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(data)
            ? data
            : [];

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
        ]

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
export function updateWorkspace(
    id,
    data = {}
) {

    const workspaces = getWorkspaces();

    const index = workspaces.findIndex(
        workspace => workspace.id === id
    );

    if (index === -1) {
        throw new Error("Workspace not found.");
    }

    workspaces[index] = {

        ...workspaces[index],

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

        })

    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(workspaces)
    );

    return workspaces[index];
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