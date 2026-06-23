import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNotes, createNote } from "../hooks/useNotes";
import TopMenu from "../components/TopMenu";

export default function Home() {
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);

    /**
     * LOAD NOTES (async from IndexedDB)
     */
    useEffect(() => {
        const load = async () => {
            const data = await getAllNotes();
            setNotes(data);
        };

        load();
    }, []);

    const handleNewNote = async () => {
        const note = await createNote();
        setNotes(prev => [note, ...prev]);
        navigate(`/note/${note.id}`);
    };

    const menuActions = [
        {
            label: "New",
            onClick: handleNewNote
        },
        {
            label: "Settings",
            onClick: () => navigate("/settings")
        }
    ];

    const formatDate = (timestamp) => {
        if (!timestamp) return "";

        const date = new Date(timestamp);

        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="w-full p-4">

            <TopMenu actions={menuActions} />

            <div className="flex flex-col gap-2">

                {notes.map(note => {
                    const title = note.title?.trim() || "Untitled";

                    return (
                        <button
                            key={note.id}
                            className="btn btn-outline w-full justify-start flex flex-col items-start"
                            onClick={() => navigate(`/note/${note.id}`)}
                        >
                            <span className="font-medium">
                                {title}
                            </span>

                            <span className="text-xs opacity-60">
                                Updated: {formatDate(note.updatedAt)}
                            </span>
                        </button>
                    );
                })}

            </div>

        </div>
    );
}