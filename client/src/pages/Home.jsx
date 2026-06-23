import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNotes, createNote } from "../hooks/useNotes";
import TopMenu from "../components/TopMenu";
import { useLoading } from "../context/LoadingContext";

/**
 * LOCALSTORAGE KEY
 */
const SORT_KEY = "chalk-sort-mode";

export default function Home() {
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [notes, setNotes] = useState([]);

    /**
     * SORT STATE (hydrated from localStorage)
     */
    const [sortMode, setSortMode] = useState(() => {
        return localStorage.getItem(SORT_KEY) || "updated-desc";
    });

    const [sortDir, setSortDir] = useState(() => {
        const saved = localStorage.getItem(SORT_KEY) || "updated-desc";
        return saved.endsWith("asc") ? "asc" : "desc";
    });

    /**
     * SAVE SORT MODE TO LOCALSTORAGE
     */
    const persistSort = (mode) => {
        localStorage.setItem(SORT_KEY, mode);
    };

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
        let next;

        if (sortMode.startsWith("updated")) {
            next =
                sortMode === "updated-desc"
                    ? "updated-asc"
                    : "updated-desc";
        } else {
            next = "updated-desc";
        }

        setSortMode(next);
        setSortDir(next.endsWith("asc") ? "asc" : "desc");
        persistSort(next);
    };

    const toggleTitleSort = () => {
        let next;

        if (sortMode.startsWith("title")) {
            next =
                sortMode === "title-asc"
                    ? "title-desc"
                    : "title-asc";
        } else {
            next = "title-asc";
        }

        setSortMode(next);
        setSortDir(next.endsWith("asc") ? "asc" : "desc");
        persistSort(next);
    };

    const menuActions = [
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
        },
        {
            label: "New",
            onClick: handleNewNote
        },
    ];

    const formatDate = (timestamp) => {
        if (!timestamp) return "";

        return new Date(timestamp).toLocaleString(undefined, {
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