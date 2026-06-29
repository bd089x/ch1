import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";

import * as SettingsUtil from "./SettingsUtil.js";

/**
 * Simple localStorage mock for tests
 */
function createLocalStorageMock() {

    let store = {};

    return {
        getItem(key) {
            return store[key] || null;
        },
        setItem(key, value) {
            store[key] = value;
        },
        clear() {
            store = {};
        }
    };

}

describe("SettingsUtil", () => {

    let mockStorage;

    beforeEach(() => {

        mockStorage = createLocalStorageMock();

        global.localStorage = mockStorage;

        mockStorage.clear();

    });

    // -----------------------------
    // getSettings defaults
    // -----------------------------
    describe("getSettings", () => {

        it("returns default settings when storage is empty", () => {

            const settings = SettingsUtil.getSettings();

            expect(settings).to.deep.include({
                version: 1
            });

            expect(settings.home.workspace_sort)
                .to.equal("created-desc");

            expect(settings.home.workspace_recent)
                .to.deep.equal([]);

        });

        it("merges stored settings with defaults", () => {

            mockStorage.setItem("app_settings", JSON.stringify({
                home: {
                    workspace_sort: "title-asc"
                }
            }));

            const settings = SettingsUtil.getSettings();

            expect(settings.home.workspace_sort)
                .to.equal("title-asc");

            expect(settings.home.workspace_recent)
                .to.deep.equal([]);

        });

    });

    // -----------------------------
    // save + get home settings
    // -----------------------------
    describe("home settings", () => {

        it("saves and retrieves home settings", () => {

            SettingsUtil.saveHomeSettings({
                workspace_sort: "title-desc",
                workspace_recent: ["a", "b"]
            });

            const home = SettingsUtil.getHomeSettings();

            expect(home.workspace_sort)
                .to.equal("title-desc");

            expect(home.workspace_recent)
                .to.deep.equal(["a", "b"]);

        });

    });

    // -----------------------------
    // workspace sort helpers
    // -----------------------------
    describe("workspace sort helpers", () => {

        it("sets and gets workspace sort", () => {

            SettingsUtil.setWorkspaceSort("title-asc");

            const sort = SettingsUtil.getWorkspaceSort();

            expect(sort).to.equal("title-asc");

        });

    });

    // -----------------------------
    // recent workspaces
    // -----------------------------
    describe("recent workspaces", () => {

        it("adds workspace to recent list", () => {

            SettingsUtil.addRecentWorkspace("w1");

            const home = SettingsUtil.getHomeSettings();

            expect(home.workspace_recent)
                .to.deep.equal(["w1"]);

        });

        it("deduplicates workspace ids", () => {

            SettingsUtil.addRecentWorkspace("w1");
            SettingsUtil.addRecentWorkspace("w2");
            SettingsUtil.addRecentWorkspace("w1");

            const home = SettingsUtil.getHomeSettings();

            expect(home.workspace_recent)
                .to.deep.equal(["w1", "w2"]);

        });

        it("respects ordering (most recent first)", () => {

            SettingsUtil.addRecentWorkspace("a");
            SettingsUtil.addRecentWorkspace("b");
            SettingsUtil.addRecentWorkspace("c");

            const home = SettingsUtil.getHomeSettings();

            expect(home.workspace_recent)
                .to.deep.equal(["c", "b", "a"]);

        });

        it("limits recent workspace length", () => {

            SettingsUtil.addRecentWorkspace("a", 3);
            SettingsUtil.addRecentWorkspace("b", 3);
            SettingsUtil.addRecentWorkspace("c", 3);
            SettingsUtil.addRecentWorkspace("d", 3);

            const home = SettingsUtil.getHomeSettings();

            expect(home.workspace_recent.length)
                .to.equal(3);

            expect(home.workspace_recent)
                .to.deep.equal(["d", "c", "b"]);

        });

    });

    // -----------------------------
    // remove + clear
    // -----------------------------
    describe("remove and clear", () => {

        it("removes a workspace from recent list", () => {

            SettingsUtil.addRecentWorkspace("a");
            SettingsUtil.addRecentWorkspace("b");
            SettingsUtil.addRecentWorkspace("c");

            SettingsUtil.removeRecentWorkspace("b");

            const home = SettingsUtil.getHomeSettings();

            expect(home.workspace_recent)
                .to.deep.equal(["c", "a"]);

        });

        it("clears all recent workspaces", () => {

            SettingsUtil.addRecentWorkspace("a");
            SettingsUtil.addRecentWorkspace("b");

            SettingsUtil.clearRecentWorkspaces();

            const home = SettingsUtil.getHomeSettings();

            expect(home.workspace_recent)
                .to.deep.equal([]);

        });

    });

});