import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopMenu from "../components/TopMenu";
import WorkspaceCard from "../components/WorkspaceCard";
import TagCard from "../components/TagCard";

import { getAllTags, createNote } from "../hooks/useNotes";
import { getWorkspaces } from "../utils/WorkspaceUtil";

import { useLoading } from "../context/LoadingContext";

export default function Home() {
    const navigate = useNavigate();

    const { showLoading, hideLoading } = useLoading();

    const [tags, setTags] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);

    /**
     * WORKSPACE SORT STATE
     */
    const [workspaceSort, setWorkspaceSort] = useState("created-desc");

    /**
     * LOAD HOME DATA
     */
    const load = async () => {
        showLoading("Loading...");

        try {
            const [tagData] = await Promise.all([
                getAllTags()
            ]);

            let ws = getWorkspaces();

            /**
             * SORT WORKSPACES
             */
            ws = [...ws].sort((a, b) => {
                switch (workspaceSort) {
                    case "created-asc":
                        return a.created_at - b.created_at;

                    case "created-desc":
                        return b.created_at - a.created_at;

                    case "title-asc":
                        return a.name.localeCompare(b.name);

                    case "title-desc":
                        return b.name.localeCompare(a.name);

                    default:
                        return b.created_at - a.created_at;
                }
            });

            setTags(tagData);
            setWorkspaces(ws);

        } finally {
            hideLoading();
        }
    };

    useEffect(() => {
        load();
    }, [workspaceSort]);

    /**
     * QUICK INBOX NOTE
     */
    const handleNew = async () => {
        showLoading("Creating inbox note...");

        try {
            await createNote({
                note_content: `#inbox\n\n`
            });

            await load();

            navigate("/editor/inbox");

        } finally {
            hideLoading();
        }
    };

    /**
     * TOGGLE SORT MODES
     */
    const toggleDateSort = () => {
        setWorkspaceSort(prev =>
            prev === "created-desc"
                ? "created-asc"
                : "created-desc"
        );
    };

    const toggleTitleSort = () => {
        setWorkspaceSort(prev =>
            prev === "title-asc"
                ? "title-desc"
                : "title-asc"
        );
    };

    const menuActions = [
        {
            label: `Date ${workspaceSort.startsWith("created") ? (workspaceSort === "created-desc" ? "↓" : "↑") : ""}`,
            onClick: toggleDateSort
        },
        {
            label: `Title ${workspaceSort.startsWith("title") ? (workspaceSort === "title-asc" ? "↑" : "↓") : ""}`,
            onClick: toggleTitleSort
        },
        {
            label: "Workspace",
            onClick: () => navigate("/workspace/create")
        },
        {
            label: "Settings",
            onClick: () => navigate("/settings")
        },
        {
            label: "New",
            onClick: handleNew
        }
    ];

    return (
        <div className="w-full max-w-3xl mx-auto p-6">

            <TopMenu actions={menuActions} />

            {/* WORKSPACES */}
            <section className="mt-8">

                <h2 className="text-xl font-semibold mb-5">
                    Workspaces
                </h2>

                <div className="flex flex-col gap-3">

                    {workspaces.length === 0 ? (
                        <div className="text-neutral-500">
                            No saved workspaces.
                        </div>
                    ) : (
                        workspaces.map(workspace => (
                            <WorkspaceCard
                                key={workspace.id}
                                workspace={workspace}
                            />
                        ))
                    )}

                </div>

            </section>

            {/* TAGS */}
            <section className="mt-12">

                <h2 className="text-xl font-semibold mb-5">
                    Tags
                </h2>

                <div className="flex flex-col gap-3">

                    {tags.length === 0 ? (
                        <div className="text-neutral-500">
                            No tags yet.
                        </div>
                    ) : (
                        tags.map(({ tag, count }) => (
                            <TagCard
                                key={tag}
                                tag={tag}
                                count={count}
                            />
                        ))
                    )}

                </div>

            </section>

        </div>
    );
}