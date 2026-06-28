import {
    getStore,
    WORKSPACE_STORE
} from "../models/Db";

import {
    sortWorkspaces,
    buildWorkspace,
    updateWorkspaceRecord
} from "../domains/WorkspaceDomain";

/**
 * Get all workspaces.
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

            resolve(
                sortWorkspaces(workspaces, sort)
            );

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
export async function createWorkspace(data = {}) {

    const { store } = await getStore(
        WORKSPACE_STORE,
        "readwrite"
    );

    const workspace = buildWorkspace(data);

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

            const updated = updateWorkspaceRecord(
                existing,
                data
            );

            const putRequest = store.put(updated);

            putRequest.onsuccess = () => resolve(updated);

            putRequest.onerror = () => reject(putRequest.error);

        };

        getRequest.onerror = () => {
            reject(getRequest.error);
        };

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
 * Delete all workspaces.
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