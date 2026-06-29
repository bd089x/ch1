import {
    normalizeTag
} from "../utils/NormalizeTagUtil.js";

/**
 * Normalize workspace tags.
 */
export function normalizeTags(tags = []) {

    return [
        ...new Set(
            tags
                .map(tag =>
                    normalizeTag(tag)
                )
                .filter(Boolean)
        )
    ];

}

/**
 * Sort workspaces.
 */
export function sortWorkspaces(
    workspaces = [],
    sort = "created-desc"
) {

    return [...workspaces].sort((a, b) => {

        switch (sort) {

            case "created-asc":
                return (a.workspace_created_at || 0) -
                       (b.workspace_created_at || 0);

            case "created-desc":
                return (b.workspace_created_at || 0) -
                       (a.workspace_created_at || 0);

            case "title-asc":
                return (a.workspace_title || "")
                    .localeCompare(b.workspace_title || "");

            case "title-desc":
                return (b.workspace_title || "")
                    .localeCompare(a.workspace_title || "");

            default:
                return (b.workspace_created_at || 0) -
                       (a.workspace_created_at || 0);

        }

    });

}

/**
 * Build a new workspace.
 */
export function buildWorkspace(
    data = {},
    deps = {}
) {

    const now = deps.now ?? Date.now();
    const id = deps.id ?? crypto.randomUUID();

    return {
        workspace_id: id,

        workspace_title: (data.workspace_title || "Untitled").trim(),

        workspace_tags: normalizeTags(data.workspace_tags),

        workspace_created_at: now,
        workspace_updated_at: now
    };
}

/**
 * Build updated workspace.
 */
export function updateWorkspaceRecord(existing, data = {}) {

    const updated = {
        ...existing,

        ...(data.workspace_title !== undefined && {
            workspace_title: data.workspace_title.trim()
        }),

        ...(data.workspace_tags !== undefined && {
            workspace_tags: normalizeTags(data.workspace_tags)
        }),

        workspace_updated_at: Date.now()
    };

    return updated;

}