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

    const tagList = useMemo(() => {
        if (!tags) return [];

        return tags
            .split(",")
            .map(tag => tag.trim().replace(/^#/, "").toLowerCase())
            .filter(Boolean);

    }, [tags]);

    const loadWorkspace = useCallback(async () => {
        showLoading("Loading workspace...");

        try {
            let data;

            if (tagList.length === 0) {
                data = await getAllNotes();
            } else {
                // Intersect all requested tags.
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
            }

            setNotes(data);

        } finally {
            hideLoading();
        }

    }, [tagList, showLoading, hideLoading]);

    useEffect(() => {
        loadWorkspace();
    }, [loadWorkspace]);

    const menuActions = [
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