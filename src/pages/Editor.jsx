import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getNote, createNote, updateNote } from "../hooks/useNotes";

export default function Editor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // Load or create note
    useEffect(() => {
        if (id === "new") {
            const newNote = createNote();
            navigate(`/note/${newNote.id}`, { replace: true });
            return;
        }

        const existing = getNote(id);

        if (existing) {
            setNote(existing);
            setTitle(existing.title || "");
            setContent(existing.content || "");
        }
    }, [id]);

    const handleSave = () => {
        if (!note) return;

        updateNote(note.id, {
            title: title.trim() || "Untitled",
            content: content
        });
    };

    return (
        <div className="flex flex-col h-screen p-4 gap-4">

            {/* Top Bar */}
            <div className="flex gap-2">

                <button
                    className="btn btn-success"
                    onClick={handleSave}
                >
                    Save
                </button>

                <button
                    className="btn btn-ghost"
                    onClick={() => navigate("/")}
                >
                    Back
                </button>

            </div>

            {/* Title Input */}
            <input
                className="
                    w-full
                    bg-black
                    text-white
                    text-xl
                    font-semibold
                    p-2
                    outline-none
                    border-b
                    border-neutral-700
                "
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title..."
            />

            {/* Content Editor */}
            <textarea
                className="
                    flex-1
                    w-full
                    resize-none
                    bg-black
                    text-white
                    p-4
                    outline-none
                    border
                    border-neutral-700
                    rounded-lg
                "
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
            />

        </div>
    );
}