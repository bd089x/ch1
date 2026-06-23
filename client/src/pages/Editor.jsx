import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TopMenu from "../components/TopMenu";
import { getNote, createNote, updateNote } from "../hooks/useNotes";
import { useLoading } from "../context/LoadingContext";

export default function Editor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, showLoading, hideLoading } = useLoading();

    const [note, setNote] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    /**
     * LOAD OR CREATE NOTE
     */
    useEffect(() => {
        const load = async () => {
            if (id === "new") {
                showLoading("Creating note...");

                try {
                    const newNote = await createNote();
                    navigate(`/note/${newNote.note_id}`, { replace: true });
                } finally {
                    hideLoading();
                }

                return;
            }

            showLoading("Opening note...");

            try {
                const existing = await getNote(id);

                if (existing) {
                    setNote(existing);
                    setTitle(existing.note_title || "");
                    setContent(existing.note_content || "");
                }
            } finally {
                hideLoading();
            }
        };

        load();
    }, [id]);

    /**
     * MANUAL SAVE
     */
    const handleSave = async () => {
        if (!note) return;

        showLoading("Saving note...");

        try {
            await updateNote(note.note_id, {
                note_title: title.trim() || "Untitled",
                note_content: content
            });

            // keep local state in sync
            setNote(prev => ({
                ...prev,
                note_title: title.trim() || "Untitled",
                note_content: content
            }));
        } finally {
            hideLoading();
        }
    };

    /**
     * AUTO SAVE (debounced)
     */
    useEffect(() => {
        if (!note) return;

        const timer = setTimeout(() => {
            updateNote(note.note_id, {
                note_title: title.trim() || "Untitled",
                note_content: content
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [title, content, note]);

    const menuActions = [
        {
            label: "Delete",
            onClick: () => navigate(`/delete/${note?.note_id || id}`)
        },
        {
            label: "Save",
            onClick: handleSave
        },
        {
            label: "Back",
            onClick: () => navigate("/")
        }
    ];

    return (
        <div className="flex flex-col h-screen p-4 gap-4">

            <TopMenu actions={menuActions} />

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
                disabled={loading}
            />

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
                disabled={loading}
            />

        </div>
    );
}