import * as workspaceService from "../services/workspace.service";

/**
 * Get every saved workspace.
 */
export async function getAllWorkspaces(data) {
    return workspaceService.getAllWorkspaces(data);
}

/**
 * Get one workspace.
 */
export async function getWorkspace(id) {
    return workspaceService.getWorkspace(id);
}

/**
 * Create a workspace.
 */
export async function createWorkspace(data) {
    return workspaceService.createWorkspace(data);
}

/**
 * Update a workspace.
 */
export async function updateWorkspace(id, data) {
    return workspaceService.updateWorkspace(id, data);
}

/**
 * Delete a workspace.
 */
export async function deleteWorkspace(id) {
    return workspaceService.deleteWorkspace(id);
}

/**
 * Remove every saved workspace.
 */
export async function deleteAllWorkspaces() {
    return workspaceService.deleteAllWorkspaces();
}