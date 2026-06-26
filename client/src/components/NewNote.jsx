import { useState } from "react";

import { createNote } from "../hooks/useNotes";

export default function NewNote({
    tags = [],
    onCreated
}) {

    const [content, setContent] = useState("");

    const handleSave = async () => {

        const text = content.trim();

        if (!text) return;

        const tagString =
            tags.length > 0
                ? tags.map(tag => `#${tag}`).join(" ") + "\n\n"
                : "";

        await createNote({
            note_content: tagString + text
        });

        setContent("");

        onCreated?.();
    };

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
                onChange={(e) =>
                    setContent(e.target.value)
                }
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