import { describe, it } from "mocha";
import { expect } from "chai";

import { normalizeTag } from "./NormalizeTagUtil.js";

describe("NormalizeTagUtil", () => {

    describe("normalizeTag", () => {

        it("trims whitespace", () => {
            expect(normalizeTag("  react  ")).to.equal("react");
        });

        it("removes leading #", () => {
            expect(normalizeTag("#react")).to.equal("react");
        });

        it("lowercases input", () => {
            expect(normalizeTag("ReAcT")).to.equal("react");
        });

        it("handles null", () => {
            expect(normalizeTag(null)).to.equal("");
        });

        it("handles undefined", () => {
            expect(normalizeTag(undefined)).to.equal("");
        });

        it("handles empty string", () => {
            expect(normalizeTag("")).to.equal("");
        });

        it("handles whitespace-only string", () => {
            expect(normalizeTag("   ")).to.equal("");
        });

        it("converts non-string values safely", () => {
            expect(normalizeTag(123)).to.equal("123");
            expect(normalizeTag(false)).to.equal("false");
        });

    });

});