import { useEffect, useRef, useState } from "react";
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

    // textarea lives outside React
    const textRef = useRef(null);

    /**
     * LOAD OR CREATE NOTE
     */
    useEffect(() => {
        const load = async () => {
            if (id === "new") {
                showLoading("Creating note...");

                try {
                    const newNote = await createNote();
                    navigate(`/note/${newNote.note_id}`, {
                        replace: true
                    });
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
                }
            } finally {
                hideLoading();
            }
        };

        load();
    }, [id]);

    /**
     * Populate textarea once note loads
     */
    useEffect(() => {
        if (!note || !textRef.current) return;

        textRef.current.value = note.note_content || "";
    }, [note]);

    /**
     * MANUAL SAVE
     */
    const handleSave = async () => {
        if (!note || !textRef.current) return;

        showLoading("Saving note...");

        try {
            const updatedContent = textRef.current.value;

            await updateNote(note.note_id, {
                note_title: title.trim() || "Untitled",
                note_content: updatedContent
            });

            setNote(prev => ({
                ...prev,
                note_title: title.trim() || "Untitled",
                note_content: updatedContent
            }));
        } finally {
            hideLoading();
        }
    };

    /**
     * AUTO SAVE
     *
     * Only depends on title changes.
     * Typing in the textarea no longer causes React rerenders.
     */
    useEffect(() => {
        if (!note) return;

        const timer = setTimeout(() => {
            if (!textRef.current) return;

            updateNote(note.note_id, {
                note_title: title.trim() || "Untitled",
                note_content: textRef.current.value
            });
        }, 1000);

        return () => clearTimeout(timer);

    }, [title, note]);

    /**
     * Autosave after user stops typing
     */
    useEffect(() => {
        if (!note || !textRef.current) return;

        const textarea = textRef.current;

        let timer;

        const handleInput = () => {
            clearTimeout(timer);

            timer = setTimeout(() => {
                updateNote(note.note_id, {
                    note_title: title.trim() || "Untitled",
                    note_content: textarea.value
                });
            }, 1000);
        };

        textarea.addEventListener("input", handleInput);

        return () => {
            clearTimeout(timer);
            textarea.removeEventListener("input", handleInput);
        };

    }, [note, title]);

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
                ref={textRef}
                className="
                    flex-1
                    w-full
                    resize-none
                    bg-black
                    text-white
                    p-4
                    outline-none
                    rounded-lg
                "
                placeholder="Start writing..."
                disabled={loading}
                spellCheck={false}
            />

        </div>
    );
}