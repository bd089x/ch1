import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { createNote } from "../composites/useNoteComposite";

export default function NewNote({
    tags = [],
    onCreated
}) {

    const [content, setContent] = useState("");

    const contentRef = useRef(content);

    /**
     * Keep latest content available for unmount save
     */
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

    /**
     * Manual save
     */
    const handleSave = async () => {

        const finalContent = buildFinalContent(contentRef.current);
        if (!finalContent) return;

        await createNote({
            note_content: finalContent
        });

        setContent("");
        onCreated?.();

    };

    /**
     * Save on unmount
     */
    useEffect(() => {

        return () => {

            const finalContent = buildFinalContent(contentRef.current);

            if (!finalContent) return;

            createNote({
                note_content: finalContent
            }).catch(() => {});

        };

    }, []);

    return (
        <div className="border border-neutral-700 rounded-lg p-3">

            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                    <span
                        key={tag}
                        className="
                            px-2
                            py-1
                            rounded-full
                            bg-neutral-800
                            text-neutral-300
                            text-xs
                        "
                    >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                ))}
            </div>

            <TextareaAutosize
                className="
                    w-full
                    resize-none
                    overflow-hidden
                    bg-black
                    text-white
                    outline-none
                "
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a new note..."
                spellCheck={false}
                minRows={1}
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