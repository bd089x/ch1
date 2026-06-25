import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TopMenu from "../components/TopMenu";
import { getNote, createNote, updateNote } from "../hooks/useNotes";
import { useLoading } from "../context/LoadingContext";

import {
    splitIntoChunks,
    joinChunks,
    updateChunk,
    normalizeChunks
} from "../lib/documentModel";

export default function Editor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, showLoading, hideLoading } = useLoading();

    const [note, setNote] = useState(null);
    const [title, setTitle] = useState("");

    const textRef = useRef(null);

    const [chunks, setChunks] = useState([]);
    const [currentChunk, setCurrentChunk] = useState(0);

    // 🧠 prevents DOM overwrite during typing
    const isTypingRef = useRef(false);

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

                    const normalized = normalizeChunks(
                        splitIntoChunks(
                            existing.note_content || ""
                        )
                    );

                    setChunks(normalized);
                    setCurrentChunk(0);
                }
            } finally {
                hideLoading();
            }
        };

        load();
    }, [id]);

    /**
     * Render chunk ONLY when switching chunks
     * (NOT when chunks update during typing)
     */
    useEffect(() => {
        if (!textRef.current) return;

        isTypingRef.current = true;

        textRef.current.value =
            chunks[currentChunk]?.text || "";

        // optional: place cursor at end on chunk switch
        requestAnimationFrame(() => {
            const el = textRef.current;
            if (!el) return;

            el.selectionStart = el.selectionEnd = el.value.length;

            isTypingRef.current = false;
        });

    }, [currentChunk]); // 👈 IMPORTANT: removed `chunks` dependency

    /**
     * MANUAL SAVE
     */
    const handleSave = async () => {
        if (!note || !textRef.current) return;

        showLoading("Saving note...");

        try {
            const updatedChunks = updateChunk(
                chunks,
                currentChunk,
                textRef.current.value
            );

            setChunks(updatedChunks);

            const whole = joinChunks(updatedChunks);

            await updateNote(note.note_id, {
                note_title: title.trim() || "Untitled",
                note_content: whole
            });

            setNote(prev => ({
                ...prev,
                note_title: title.trim() || "Untitled",
                note_content: whole
            }));

        } finally {
            hideLoading();
        }
    };

    /**
     * AUTOSAVE TITLE ONLY
     */
    useEffect(() => {
        if (!note) return;

        const timer = setTimeout(() => {
            updateNote(note.note_id, {
                note_title: title.trim() || "Untitled",
                note_content: joinChunks(chunks)
            });
        }, 1000);

        return () => clearTimeout(timer);

    }, [title, note]);

    /**
     * AUTOSAVE CURRENT CHUNK (NO STATE REWRITE DURING TYPING)
     */
    useEffect(() => {
        if (!note || !textRef.current) return;

        const textarea = textRef.current;

        let timer;

        const handleInput = () => {
            isTypingRef.current = true;

            clearTimeout(timer);

            timer = setTimeout(() => {
                const updatedChunks = updateChunk(
                    chunks,
                    currentChunk,
                    textarea.value
                );

                setChunks(updatedChunks);

                updateNote(note.note_id, {
                    note_title: title.trim() || "Untitled",
                    note_content: joinChunks(updatedChunks)
                });

                isTypingRef.current = false;

            }, 1000);
        };

        textarea.addEventListener("input", handleInput);

        return () => {
            clearTimeout(timer);
            textarea.removeEventListener("input", handleInput);
        };

    }, [note, title, chunks, currentChunk]);

    /**
     * Chunk navigation helpers
     */
    const goPrevChunk = () => {
        setChunks(prev => {
            const updated = updateChunk(
                prev,
                currentChunk,
                textRef.current?.value || ""
            );
            return updated;
        });

        setCurrentChunk(c => Math.max(0, c - 1));
    };

    const goNextChunk = () => {
        setChunks(prev => {
            const updated = updateChunk(
                prev,
                currentChunk,
                textRef.current?.value || ""
            );
            return updated;
        });

        setCurrentChunk(c =>
            Math.min(chunks.length - 1, c + 1)
        );
    };

    const menuActions = [
        {
            label: "Delete",
            onClick: () =>
                navigate(`/delete/${note?.note_id || id}`)
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

            {/* Chunk controls */}
            <div className="flex items-center gap-2 text-sm text-gray-400">

                <button onClick={goPrevChunk}>
                    ◀
                </button>

                <span>
                    Chunk {currentChunk + 1} / {chunks.length}
                </span>

                <button onClick={goNextChunk}>
                    ▶
                </button>

            </div>

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
                    border
                    border-neutral-700
                    rounded-lg
                "
                placeholder="Start writing..."
                disabled={loading}
                spellCheck={false}
            />

        </div>
    );
}