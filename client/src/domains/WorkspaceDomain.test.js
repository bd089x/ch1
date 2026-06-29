import { describe, it } from "mocha";
import { expect } from "chai";

import {
    normalizeTags,
    sortWorkspaces,
    buildWorkspace,
    updateWorkspaceRecord
} from "./WorkspaceDomain.js";

describe("WorkspaceDomain", () => {

    // -----------------------------
    // normalizeTags
    // -----------------------------
    describe("normalizeTags", () => {

        it("normalizes and deduplicates tags", () => {

            const result = normalizeTags([
                "#React",
                "react",
                "  JS  ",
                "#js"
            ]);

            expect(result).to.deep.equal(["react", "js"]);

        });

        it("filters empty values", () => {

            const result = normalizeTags([
                "#react",
                "",
                "   ",
                null,
                undefined
            ]);

            expect(result).to.deep.equal(["react"]);

        });

    });

    // -----------------------------
    // sortWorkspaces
    // -----------------------------
    describe("sortWorkspaces", () => {

        const workspaces = [
            {
                workspace_title: "B",
                workspace_created_at: 2
            },
            {
                workspace_title: "A",
                workspace_created_at: 1
            },
            {
                workspace_title: "C",
                workspace_created_at: 3
            }
        ];

        it("sorts by created-desc by default", () => {

            const result = sortWorkspaces(workspaces);

            expect(result.map(w => w.workspace_created_at))
                .to.deep.equal([3, 2, 1]);

        });

        it("sorts created-asc", () => {

            const result = sortWorkspaces(workspaces, "created-asc");

            expect(result.map(w => w.workspace_created_at))
                .to.deep.equal([1, 2, 3]);

        });

        it("sorts title-asc", () => {

            const result = sortWorkspaces(workspaces, "title-asc");

            expect(result.map(w => w.workspace_title))
                .to.deep.equal(["A", "B", "C"]);

        });

        it("sorts title-desc", () => {

            const result = sortWorkspaces(workspaces, "title-desc");

            expect(result.map(w => w.workspace_title))
                .to.deep.equal(["C", "B", "A"]);

        });

    });

    // -----------------------------
    // buildWorkspace
    // -----------------------------
    describe("buildWorkspace", () => {

        it("creates workspace with defaults and normalized tags", () => {

            const workspace = buildWorkspace(
                {
                    workspace_title: "Notes",
                    workspace_tags: ["#React", "js", "JS"]
                },
                {
                    now: 123,
                    id: "abc"
                }
            );

            expect(workspace).to.deep.equal({
                workspace_id: "abc",
                workspace_title: "Notes",
                workspace_tags: ["react", "js"],
                workspace_created_at: 123,
                workspace_updated_at: 123
            });

        });

        it("uses Untitled when workspace_title missing", () => {

            const workspace = buildWorkspace(
                {
                    workspace_tags: ["react"]
                },
                {
                    now: 123,
                    id: "x1"
                }
            );

            expect(workspace.workspace_title).to.equal("Untitled");

        });

    });

    // -----------------------------
    // updateWorkspaceRecord
    // -----------------------------
    describe("updateWorkspaceRecord", () => {

        it("updates workspace_title and workspace_tags when provided", () => {

            const existing = {
                workspace_id: "1",
                workspace_title: "Old",
                workspace_tags: ["old"],
                workspace_created_at: 1,
                workspace_updated_at: 1
            };

            const updated = updateWorkspaceRecord(existing, {
                workspace_title: "New Name",
                workspace_tags: ["#react", "js"]
            });

            expect(updated.workspace_title).to.equal("New Name");
            expect(updated.workspace_tags).to.deep.equal(["react", "js"]);

        });

        it("only updates provided fields", () => {

            const existing = {
                workspace_id: "1",
                workspace_title: "Old",
                workspace_tags: ["old"],
                workspace_created_at: 1,
                workspace_updated_at: 1
            };

            const updated = updateWorkspaceRecord(existing, {
                workspace_title: "Updated Only"
            });

            expect(updated.workspace_title).to.equal("Updated Only");
            expect(updated.workspace_tags).to.deep.equal(["old"]);

        });

    });

});