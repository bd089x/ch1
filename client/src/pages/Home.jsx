import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNotes, createNote } from "../hooks/useNotes";
import TopMenu from "../components/TopMenu";
import { useLoading } from "../context/LoadingContext";

export default function Home() {
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [notes, setNotes] = useState([]);

    /**
     * SORT STATE
     */
    const [sortMode, setSortMode] = useState("updated-desc");
    const [sortDir, setSortDir] = useState("desc");
    // desc = newest / Z-A
    // asc = oldest / A-Z

    /**
     * LOAD NOTES (whenever sort changes)
     */
    useEffect(() => {
        const load = async () => {
            showLoading("Loading notes...");

            try {
                const data = await getAllNotes(sortMode);
                setNotes(data);
            } finally {
                hideLoading();
            }
        };

        load();
    }, [sortMode]);

    /**
     * NEW NOTE
     */
    const handleNewNote = async () => {
        showLoading("Creating note...");

        try {
            const note = await createNote();
            setNotes(prev => [note, ...prev]);
            navigate(`/note/${note.id}`);
        } finally {
            hideLoading();
        }
    };

    /**
     * SORT HELPERS
     */
    const toggleDateSort = () => {
        if (sortMode.startsWith("updated")) {
            const next =
                sortMode === "updated-desc"
                    ? "updated-asc"
                    : "updated-desc";

            setSortMode(next);
            setSortDir(next.endsWith("asc") ? "asc" : "desc");
        } else {
            setSortMode("updated-desc");
            setSortDir("desc");
        }
    };

    const toggleTitleSort = () => {
        if (sortMode.startsWith("title")) {
            const next =
                sortMode === "title-asc"
                    ? "title-desc"
                    : "title-asc";

            setSortMode(next);
            setSortDir(next.endsWith("asc") ? "asc" : "desc");
        } else {
            setSortMode("title-asc");
            setSortDir("asc");
        }
    };

    const menuActions = [
        {
            label: "New",
            onClick: handleNewNote
        },
        {
            label: `Date ${sortMode.startsWith("updated") ? (sortDir === "desc" ? "↓" : "↑") : ""}`,
            onClick: toggleDateSort
        },
        {
            label: `Title ${sortMode.startsWith("title") ? (sortDir === "desc" ? "↓" : "↑") : ""}`,
            onClick: toggleTitleSort
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