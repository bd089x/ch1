import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TopMenu from "../components/TopMenu";
import { getNote, createNote, updateNote } from "../hooks/useNotes";

export default function Editor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    /**
     * LOAD OR CREATE NOTE (ASYNC FIX)
     */
    useEffect(() => {
        const load = async () => {
            if (id === "new") {
                const newNote = await createNote();
                navigate(`/note/${newNote.id}`, { replace: true });
                return;
            }

            const existing = await getNote(id);

            if (existing) {
                setNote(existing);
                setTitle(existing.title || "");
                setContent(existing.content || "");
            }
        };

        load();
    }, [id]);

    /**
     * MANUAL SAVE
     */
    const handleSave = async () => {
        if (!note) return;

        await updateNote(note.id, {
            title: title.trim() || "Untitled",
            content
        });
    };

    /**
     * AUTO SAVE (debounced)
     */
    useEffect(() => {
        if (!note) return;

        const timer = setTimeout(() => {
            updateNote(note.id, {
                title: title.trim() || "Untitled",
                content
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [title, content, note]);

    const menuActions = [
        {
            label: "Save",
            onClick: handleSave
        },
        {
            label: "Back",
            onClick: () => navigate("/")
        },
        {
            label: "Delete",
            onClick: () => navigate(`/delete/${id}`)
        }
    ];

    return (
        <div className="flex flex-col h-screen p-4 gap-4">

            {/* Top Menu */}
            <TopMenu actions={menuActions} />

            {/* Title */}
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

            {/* Content */}
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