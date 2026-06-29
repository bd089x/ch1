import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TopMenu from "../components/TopMenuComponent";
import NewNote from "../components/NewNoteComponent";
import NoteCard from "../components/NoteCardComponent";

import {
    getAllNotes,
    getNotesByTag
} from "../composites/useNoteComposite";

import { useLoading } from "../context/LoadingContext";

export default function Editor() {

    const { tags } = useParams();
    const navigate = useNavigate();

    const { showLoading, hideLoading } = useLoading();

    const [notes, setNotes] = useState([]);
    const [sortMode, setSortMode] = useState("created-desc");

    /**
     * Parse route tags → normalized array
     */
    const tagList = tags
        ? tags
            .split(",")
            .map(tag =>
                tag.trim().replace(/^#/, "").toLowerCase()
            )
            .filter(Boolean)
        : [];

    /**
     * LOAD NOTES
     */
    async function loadWorkspace() {

        showLoading("Loading workspace...");

        try {

            let data;

            /**
             * CASE 1: no tags → full note list
             */
            if (tagList.length === 0) {

                data = await getAllNotes(sortMode);

            } else {

                /**
                 * CASE 2: intersection of tagged notes
                 */
                const groups = await Promise.all(
                    tagList.map(tag => getNotesByTag(tag))
                );

                data = groups.reduce((acc, current, index) => {

                    if (index === 0) return current;

                    const ids = new Set(
                        current.map(note => note.note_id)
                    );

                    return acc.filter(note =>
                        ids.has(note.note_id)
                    );

                }, []);

                /**
                 * Local sort for filtered results
                 */
                data.sort((a, b) => {

                    if (sortMode === "created-asc") {
                        return a.note_created_at - b.note_created_at;
                    }

                    return b.note_created_at - a.note_created_at;
                });
            }

            setNotes(data);

        } finally {

            hideLoading();

        }
    }

    /**
     * Reload whenever route tags or sort order changes.
     */
    useEffect(() => {
        loadWorkspace();
    }, [tags, sortMode]);

    /**
     * TOGGLE SORT ORDER
     */
    function toggleDateSort() {

        setSortMode(prev =>
            prev === "created-desc"
                ? "created-asc"
                : "created-desc"
        );

    }

    const menuActions = [
        {
            label: `Date ${sortMode === "created-desc" ? "↓" : "↑"}`,
            onClick: toggleDateSort
        },
        {
            label: "Back",
            onClick: () => navigate("/")
        }
    ];

    return (
        <div className="flex flex-col h-screen p-4 gap-4">

            <TopMenu actions={menuActions} />

            <NewNote
                tags={tagList}
                onCreated={loadWorkspace}
            />

            {notes.map(note => (
                <NoteCard
                    key={note.note_id}
                    note={note}
                    onDeleted={loadWorkspace}
                />
            ))}

        </div>
    );
}