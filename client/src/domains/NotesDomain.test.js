import { describe, it } from "mocha";
import { expect } from "chai";

import {
    extractTags,
    sortNotes,
    countTags,
    buildNote,
    updateNoteRecord
} from "./NotesDomain.js";

describe("NoteDomain", () => {

     // -----------------------------
    // extractTags
    // -----------------------------
    describe("extractTags", () => {

        it("extracts unique lowercase tags", () => {

            const result = extractTags("#React #react #Todo");

            expect(result).to.deep.equal(["react", "todo"]);

        });

        it("returns empty array when no tags exist", () => {

            expect(extractTags("hello world")).to.deep.equal([]);

        });

    });

    // -----------------------------
    // sortNotes
    // -----------------------------
    describe("sortNotes", () => {

        const notes = [
            { note_created_at: 3 },
            { note_created_at: 1 },
            { note_created_at: 2 }
        ];

        it("sorts descending by default", () => {

            const result = sortNotes(notes);

            expect(result.map(n => n.note_created_at))
                .to.deep.equal([3, 2, 1]);

        });

        it("sorts ascending", () => {

            const result = sortNotes(notes, "created-asc");

            expect(result.map(n => n.note_created_at))
                .to.deep.equal([1, 2, 3]);

        });

    });

    // -----------------------------
    // countTags
    // -----------------------------
    describe("countTags", () => {

        it("counts tags correctly", () => {

            const notes = [
                { note_tags: ["react", "js"] },
                { note_tags: ["react"] }
            ];

            const result = countTags(notes);

            expect(result).to.deep.equal([
                { tag: "react", count: 2 },
                { tag: "js", count: 1 }
            ]);

        });

    });

    // -----------------------------
    // buildNote
    // -----------------------------
    describe("buildNote", () => {

        it("creates a note with tags and timestamps", () => {

            const note = buildNote(
                { note_content: "#react hello" },
                {
                    now: 123,
                    id: "abc"
                }
            );

            expect(note).to.deep.equal({
                note_id: "abc",
                note_content: "#react hello",
                note_tags: ["react"],
                note_created_at: 123,
                note_updated_at: 123
            });

        });

    });

    // -----------------------------
    // updateNoteRecord
    // -----------------------------
    describe("updateNoteRecord", () => {

        it("updates content and regenerates tags", () => {

            const existing = {
                note_content: "old",
                note_tags: ["old"],
                note_created_at: 1,
                note_updated_at: 1
            };

            const updated = updateNoteRecord(existing, {
                note_content: "#react new"
            });

            expect(updated.note_content).to.equal("#react new");
            expect(updated.note_tags).to.deep.equal(["react"]);
            expect(updated.note_updated_at).to.be.greaterThan(0);

        });

    });

});