import {
    useEffect,
    useMemo,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
    getAllTags,
    getNotesByTag
} from "../composites/useNoteComposite";

import {
    countTags
} from "../domains/NotesDomain";

export default function TagExplorer({
    selectedTags = []
}) {

    const navigate = useNavigate();

    const [tags, setTags] = useState([]);

    const [loading, setLoading] = useState(true);

    /**
     * Load tags from current context.
     */
    useEffect(() => {

        let mounted = true;

        async function loadTags() {

            setLoading(true);
            setTags([]);

            let result = [];

            /**
             * No active tags.
             *
             * Use global tag counts.
             */
            if (selectedTags.length === 0) {

                result = await getAllTags();

            } else {

                /**
                 * Active tags.
                 *
                 * Find notes matching all selected tags,
                 * then count tags inside that context.
                 */
                const groups = await Promise.all(
                    selectedTags.map(tag =>
                        getNotesByTag(tag)
                    )
                );

                const notes = groups.reduce((acc, current, index) => {

                    if (index === 0) {
                        return current;
                    }

                    const ids = new Set(
                        current.map(note => note.note_id)
                    );

                    return acc.filter(note =>
                        ids.has(note.note_id)
                    );

                }, []);

                result = countTags(notes);

            }

            if (mounted) {

                setTags(result);

                setLoading(false);

            }

        }

        loadTags();

        return () => {
            mounted = false;
        };

    }, [selectedTags.join(",")]);

    /**
     * Sort tags.
     */
    const sortedTags = useMemo(() => {

        return [...tags].sort((a, b) => {

            const aSelected =
                selectedTags.includes(a.tag);

            const bSelected =
                selectedTags.includes(b.tag);

            if (aSelected !== bSelected) {
                return aSelected ? -1 : 1;
            }

            if (b.count !== a.count) {
                return b.count - a.count;
            }

            return a.tag.localeCompare(b.tag);

        });

    }, [tags, selectedTags]);

    /**
     * Toggle tag in route.
     */
    function toggleTag(tag) {

        let next;

        if (selectedTags.includes(tag)) {

            next = selectedTags.filter(
                t => t !== tag
            );

        } else {

            next = [
                ...selectedTags,
                tag
            ];

        }

        if (next.length === 0) {

            navigate("/editor");

        } else {

            navigate(
                `/editor/${next.join(",")}`
            );

        }

    }

    return (

        <div
            className="
                flex
                gap-2
                overflow-x-auto
                whitespace-nowrap
                pb-1
                scrollbar-hide
                [-ms-overflow-style:none]
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
            "
        >

            {loading && (

                <button
                    disabled
                    className="
                        flex-shrink-0
                        px-4 py-2
                        rounded-full
                        border
                        text-sm
                        font-medium
                        bg-zinc-900
                        text-zinc-400
                        border-zinc-700
                    "
                >
                    Loading...
                </button>

            )}

            {!loading && sortedTags.map(({ tag, count }) => {

                const active =
                    selectedTags.includes(tag);

                return (

                    <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={[
                            "flex-shrink-0",
                            "px-4 py-2",
                            "rounded-full",
                            "border",
                            "text-sm",
                            "font-medium",
                            "transition-colors",
                            active
                                ? "bg-zinc-700 text-white border-zinc-600"
                                : "bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800"
                        ].join(" ")}
                    >
                        #{tag} ({count})
                    </button>

                );

            })}

        </div>

    );

}