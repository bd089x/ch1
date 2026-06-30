import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import {
    updateNote,
    deleteNote
} from "../composites/useNoteComposite";

export default function NoteCard({
    note,
    onDeleted
}) {

    const [content, setContent] = useState(
        note.note_content
    );

    /**
     * Keep local state in sync when switching notes
     */
    useEffect(() => {
        setContent(note.note_content || "");
    }, [note.note_id]);

    /**
     * Autosave (debounced)
     */
    useEffect(() => {

        const timer = setTimeout(() => {

            if (content === note.note_content) return;

            updateNote(note.note_id, {
                note_content: content
            });

        }, 750);

        return () => clearTimeout(timer);

    }, [content, note.note_id, note.note_content]);

    const handleDelete = async () => {

        if (!window.confirm("Delete this note?"))
            return;

        await deleteNote(note.note_id);

        onDeleted?.();

    };

    return (

        <div className="border border-neutral-800 rounded-lg p-3">

            <div className="flex justify-between items-center mb-2">

                <div className="text-xs text-neutral-500">

                    {new Date(
                        note.note_updated_at
                    ).toLocaleString()}

                </div>

                <button
                    className="text-red-400 text-sm"
                    onClick={handleDelete}
                >
                    Delete
                </button>

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
                spellCheck={false}
                minRows={1}
            />

        </div>

    );
}