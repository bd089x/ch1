import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function TagExplorer({
    notes = [],
    selectedTags = []
}) {

    const navigate = useNavigate();

    /**
     * Count tag usage within the current note set.
     */
    const tags = useMemo(() => {

        const counts = new Map();

        for (const note of notes) {

            for (const tag of note.note_tags || []) {

                counts.set(
                    tag,
                    (counts.get(tag) || 0) + 1
                );

            }

        }

        return [...counts.entries()]
            .sort((a, b) => {

                /**
                 * Selected tags first.
                 */
                const aSelected = selectedTags.includes(a[0]);
                const bSelected = selectedTags.includes(b[0]);

                if (aSelected !== bSelected) {
                    return aSelected ? -1 : 1;
                }

                /**
                 * Then by frequency.
                 */
                if (b[1] !== a[1]) {
                    return b[1] - a[1];
                }

                /**
                 * Finally alphabetically.
                 */
                return a[0].localeCompare(b[0]);

            });

    }, [notes, selectedTags]);

    /**
     * Toggle a tag in the current route.
     */
    function toggleTag(tag) {

        let next;

        if (selectedTags.includes(tag)) {

            next = selectedTags.filter(t => t !== tag);

        } else {

            next = [...selectedTags, tag];

        }

        if (next.length === 0) {

            navigate("/editor");

        } else {

            navigate(`/editor/${next.join(",")}`);

        }

    }

    if (tags.length === 0) {
        return null;
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

            {tags.map(([tag, count]) => {

                const active = selectedTags.includes(tag);

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