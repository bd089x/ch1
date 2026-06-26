import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TopMenu from "../components/TopMenu";
import NewNote from "../components/NewNote";
import NoteCard from "../components/NoteCard";

import {
    getAllNotes,
    getNotesByTag
} from "../hooks/useNotes";

import { useLoading } from "../context/LoadingContext";

export default function Editor() {
    const { tags } = useParams();
    const navigate = useNavigate();

    const { showLoading, hideLoading } = useLoading();

    const [notes, setNotes] = useState([]);

    /**
     * SORT STATE (created_at only)
     */
    const [sortMode, setSortMode] = useState("created-desc");

    const tagList = useMemo(() => {
        if (!tags) return [];

        return tags
            .split(",")
            .map(tag =>
                tag.trim().replace(/^#/, "").toLowerCase()
            )
            .filter(Boolean);
    }, [tags]);

    /**
     * LOAD WORKSPACE
     */
    const loadWorkspace = useCallback(async () => {
        showLoading("Loading workspace...");

        try {
            let data;

            if (tagList.length === 0) {
                data = await getAllNotes(sortMode);
            } else {
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

                // apply sorting locally for filtered results
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

    }, [tagList, sortMode, showLoading, hideLoading]);

    useEffect(() => {
        loadWorkspace();
    }, [loadWorkspace]);

    /**
     * TOGGLE DATE SORT
     */
    const toggleDateSort = () => {
        setSortMode(prev =>
            prev === "created-desc"
                ? "created-asc"
                : "created-desc"
        );
    };

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