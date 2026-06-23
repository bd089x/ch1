import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TopMenu from "../components/TopMenu";
import { getNote, deleteNote } from "../hooks/useNotes";

export default function Delete() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState(null);
    const [confirmText, setConfirmText] = useState("");

    /**
     * LOAD NOTE
     */
    useEffect(() => {
        const load = async () => {
            const data = await getNote(id);
            setNote(data);
        };

        load();
    }, [id]);

    /**
     * DELETE ACTION
     */
    const handleDelete = async () => {
        if (!note) return;

        if (confirmText !== note.note_title) return;

        await deleteNote(note.note_id);

        navigate("/");
    };

    const menuActions = [
        {
            label: "Back",
            onClick: () => navigate("/")
        }
    ];

    if (!note) {
        return (
            <div className="p-4 text-white">
                Loading...
            </div>
        );
    }

    const canDelete = confirmText === note.note_title;

    return (
        <div className="p-4 flex flex-col gap-6">

            <TopMenu actions={menuActions} />

            {/* Title Display */}
            <div className="text-xl font-bold">
                Delete: {note.note_title}
            </div>

            {/* Warning */}
            <div className="text-sm opacity-70">
                Type the exact title to confirm deletion.
            </div>

            {/* Input */}
            <input
                className="
                    w-full
                    p-3
                    bg-black
                    border
                    border-neutral-700
                    text-white
                    rounded-lg
                "
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type note title..."
            />

            {/* Delete Button */}
            <button
                className={`
                    btn w-full
                    ${canDelete ? "btn-error" : "btn-disabled"}
                `}
                disabled={!canDelete}
                onClick={handleDelete}
            >
                Delete Note
            </button>

        </div>
    );
}