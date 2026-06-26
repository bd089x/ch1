import { useEffect, useRef, useState } from "react";
import { createNote } from "../hooks/useNotes";

export default function NewNote({
    tags = [],
    onCreated
}) {

    const [content, setContent] = useState("");

    // keep latest content accessible inside unmount cleanup
    const contentRef = useRef(content);

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    const extractTags = (text) => {
        return [
            ...new Set(
                [...text.matchAll(/#([\w-]+)/g)]
                    .map(match => match[1].toLowerCase())
            )
        ];
    };

    const stripTags = (text) => {
        return text
            .replace(/#[\w-]+/g, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    };

    const buildFinalContent = (rawText) => {

        const text = rawText.trim();
        if (!text) return null;

        const baseTags = tags.map(t =>
            t.replace(/^#/, "").toLowerCase()
        );

        const inlineTags = extractTags(text);

        const allTags = [...new Set([
            ...baseTags,
            ...inlineTags
        ])];

        const cleanText = stripTags(text);

        const tagString =
            allTags.length > 0
                ? allTags.map(tag => `#${tag}`).join(" ")
                : "";

        return tagString
            ? `${tagString}\n\n${cleanText}`
            : cleanText;
    };

    const handleSave = async () => {

        const finalContent = buildFinalContent(content);
        if (!finalContent) return;

        await createNote({
            note_content: finalContent
        });

        setContent("");
        onCreated?.();
    };

    /**
     * 🔥 SAVE ON UNMOUNT (back navigation / route change)
     */
    useEffect(() => {

        return () => {

            const finalContent = buildFinalContent(contentRef.current);

            if (!finalContent) return;

            // best-effort fire-and-forget save
            createNote({
                note_content: finalContent
            }).catch(() => {
                // silent fail (user is already leaving)
            });

        };

    }, [tags]);

    return (
        <div className="border border-neutral-700 rounded-lg p-3">

            <div className="text-sm text-neutral-400 mb-2">
                New Note
            </div>

            <textarea
                className="
                    w-full
                    min-h-32
                    resize-none
                    bg-black
                    text-white
                    outline-none
                "
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a new note..."
                spellCheck={false}
            />

            <div className="flex justify-end mt-3">
                <button
                    className="px-4 py-2 border rounded"
                    onClick={handleSave}
                >
                    Save
                </button>
            </div>

        </div>
    );
}