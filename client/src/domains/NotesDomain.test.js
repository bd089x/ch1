import { describe, it } from "mocha";
import { expect } from "chai";

import {
    extractTags,
    sortNotes,
    paginateNotes,
    countTags,
    buildNote,
    updateNoteRecord,
    restoreNoteRecord
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
    // paginateNotes
    // -----------------------------
    describe("paginateNotes", () => {

        const notes = [
            { note_id: 1 },
            { note_id: 2 },
            { note_id: 3 },
            { note_id: 4 },
            { note_id: 5 }
        ];


        it("returns the requested page of notes", () => {

            const result = paginateNotes(
                notes,
                2,
                2
            );

            expect(result.notes)
                .to.deep.equal([
                    { note_id: 3 },
                    { note_id: 4 }
                ]);

        });


        it("returns pagination metadata", () => {

            const result = paginateNotes(
                notes,
                1,
                2
            );

            expect(result.page)
                .to.equal(1);

            expect(result.pageSize)
                .to.equal(2);

            expect(result.total)
                .to.equal(5);

            expect(result.totalPages)
                .to.equal(3);

        });


        it("returns the final partial page", () => {

            const result = paginateNotes(
                notes,
                3,
                2
            );

            expect(result.notes)
                .to.deep.equal([
                    { note_id: 5 }
                ]);

        });


        it("returns empty notes when page exceeds available pages", () => {

            const result = paginateNotes(
                notes,
                10,
                2
            );

            expect(result.notes)
                .to.deep.equal([]);

        });


        it("handles empty note arrays", () => {

            const result = paginateNotes(
                [],
                1,
                50
            );

            expect(result.notes)
                .to.deep.equal([]);

            expect(result.total)
                .to.equal(0);

            expect(result.totalPages)
                .to.equal(0);

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

// -----------------------------
// restoreNoteRecord
// -----------------------------
describe("restoreNoteRecord", () => {

    it("restores a full note exactly", () => {

        const input = {
            note_id: "123",
            note_content: "Hello #react",
            note_tags: ["react"],
            note_created_at: 1000,
            note_updated_at: 2000
        };

        const result = restoreNoteRecord(input);

        expect(result).to.deep.equal(input);

    });

    it("generates id when missing", () => {

        const result = restoreNoteRecord({
            note_content: "Hello #react",
            note_tags: ["react"],
            note_created_at: 1000,
            note_updated_at: 2000
        });

        expect(result.note_id).to.be.a("string");
        expect(result.note_id).to.have.length.greaterThan(0);

    });

    it("falls back to empty content when missing", () => {

        const result = restoreNoteRecord({
            note_id: "1"
        });

        expect(result.note_content).to.equal("");

    });

    it("derives tags from content when note_tags missing", () => {

        const result = restoreNoteRecord({
            note_content: "#React #JS"
        });

        expect(result.note_tags).to.deep.equal(["react", "js"]);

    });

    it("preserves provided tags over derived ones", () => {

        const result = restoreNoteRecord({
            note_content: "#React #JS",
            note_tags: ["custom"]
        });

        expect(result.note_tags).to.deep.equal(["custom"]);

    });

    it("falls back timestamps when missing", () => {

        const result = restoreNoteRecord({
            note_id: "1",
            note_content: "hello"
        });

        expect(result.note_created_at).to.be.a("number");
        expect(result.note_updated_at).to.be.a("number");

    });

});