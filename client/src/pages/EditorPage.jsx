import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import TopMenu from "../components/TopMenuComponent";
import NewNote from "../components/NewNoteComponent";
import NoteCard from "../components/NoteCardComponent";
import TagExplorer from "../components/TagExplorerComponent";

import {
    getAllNotes,
    getNotesByTag
} from "../composites/useNoteComposite";

import {
    paginateNotes
} from "../domains/NotesDomain";

import { useLoading } from "../context/LoadingContext";

const PAGE_SIZE = 50;

export default function Editor() {

    const { tags } = useParams();

    const navigate = useNavigate();

    const {
        showLoading,
        hideLoading
    } = useLoading();

    const [notes, setNotes] = useState([]);

    const [page, setPage] = useState(1);

    const [hasMore, setHasMore] = useState(false);

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
    async function loadWorkspace(
        nextPage = 1,
        append = false
    ) {

        showLoading("Loading workspace...");

        try {

            let allNotes = [];


            /**
             * CASE 1:
             * No tags.
             */
            if (tagList.length === 0) {

                allNotes = await getAllNotes(
                    sortMode
                );

            } else {

                /**
                 * CASE 2:
                 * Tagged intersection.
                 */
                const groups = await Promise.all(
                    tagList.map(tag =>
                        getNotesByTag(tag)
                    )
                );


                allNotes = groups.reduce((acc, current, index) => {

                    if (index === 0) {
                        return current;
                    }

                    const ids = new Set(
                        current.map(note =>
                            note.note_id
                        )
                    );

                    return acc.filter(note =>
                        ids.has(note.note_id)
                    );

                }, []);


                allNotes.sort((a, b) => {

                    if (sortMode === "created-asc") {
                        return (
                            a.note_created_at -
                            b.note_created_at
                        );
                    }

                    return (
                        b.note_created_at -
                        a.note_created_at
                    );

                });

            }


            const result = paginateNotes(
                allNotes,
                nextPage,
                PAGE_SIZE
            );


            setHasMore(
                result.page < result.totalPages
            );


            if (append) {

                setNotes(prev => [
                    ...prev,
                    ...result.notes
                ]);

            } else {

                setNotes(result.notes);

            }

            setPage(nextPage);

        } finally {

            hideLoading();

        }

    }


    /**
     * Reset when workspace changes.
     */
    useEffect(() => {

        setPage(1);

        loadWorkspace(1, false);

    }, [tags, sortMode]);


    /**
     * Load next page.
     */
    function loadMore() {

        loadWorkspace(
            page + 1,
            true
        );

    }


    /**
     * Toggle sort.
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

        <div className="flex flex-col p-4 gap-4">

            <TopMenu actions={menuActions} />


            <NewNote
                tags={tagList}
                onCreated={() =>
                    loadWorkspace(1, false)
                }
            />


            <TagExplorer
                selectedTags={tagList}
            />


            {notes.map(note => (

                <NoteCard
                    key={note.note_id}
                    note={note}
                    onDeleted={() =>
                        loadWorkspace(1, false)
                    }
                />

            ))}


            {hasMore && (

                <button
                    onClick={loadMore}
                    className="
                        px-4
                        py-2
                        rounded-lg
                        border
                        border-zinc-700
                        bg-zinc-900
                        text-zinc-200
                    "
                >
                    Load More
                </button>

            )}

        </div>

    );

}