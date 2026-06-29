import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopMenu from "../components/TopMenuComponent";
import WorkspaceCard from "../components/WorkspaceCardComponent";
import TagCard from "../components/TagCardComponent";

import { getAllTags, createNote } from "../composites/useNoteComposite";
import { getAllWorkspaces } from "../composites/useWorkspaceComposite";

import { useLoading } from "../context/LoadingContext";

import {
    getHomeSettings,
    saveHomeSettings
} from "../utils/SettingsUtil";

export default function Home() {

    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [tags, setTags] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);

    const [homeSettings, setHomeSettings] = useState(() =>
        getHomeSettings()
    );

    const workspaceSort = homeSettings.workspace_sort;
    const recentWorkspaceIds = homeSettings.workspace_recent;

    /**
     * LOAD HOME DATA
     */
    const load = async () => {

        showLoading("Loading...");

        try {

            const [tagData, wsData] = await Promise.all([
                getAllTags(),
                getAllWorkspaces(workspaceSort)
            ]);

            setTags(tagData);
            setWorkspaces(wsData);

        } finally {
            hideLoading();
        }
    };

    useEffect(() => {
        load();
    }, [workspaceSort]);

    /**
     * UPDATE SORT
     */
    const updateSort = (nextSort) => {

        const updated = {
            ...homeSettings,
            workspace_sort: nextSort
        };

        setHomeSettings(updated);
        saveHomeSettings(updated);

    };

    const toggleDateSort = () => {

        updateSort(
            workspaceSort === "created-desc"
                ? "created-asc"
                : "created-desc"
        );

    };

    const toggleTitleSort = () => {

        updateSort(
            workspaceSort === "title-asc"
                ? "title-desc"
                : "title-asc"
        );

    };

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

    const menuActions = [
        {
            label: `Date ${workspaceSort.startsWith("created")
                ? (workspaceSort === "created-desc" ? "↓" : "↑")
                : ""}`,
            onClick: toggleDateSort
        },
        {
            label: `Title ${workspaceSort.startsWith("title")
                ? (workspaceSort === "title-asc" ? "↑" : "↓")
                : ""}`,
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

    /**
     * RECENT WORKSPACES
     */
    const recentWorkspaces = recentWorkspaceIds
        .map(id =>
            workspaces.find(w =>
                w.workspace_id === id
            )
        )
        .filter(Boolean);

    return (
        <div className="w-full max-w-3xl mx-auto p-6">

            <TopMenu actions={menuActions} />

            {/* RECENT WORKSPACES */}
            {recentWorkspaces.length > 0 && (
                <section className="mt-6">

                    <h2 className="text-xl font-semibold mb-5">
                        Recent
                    </h2>

                    <div className="flex flex-col gap-3">

                        {recentWorkspaces.map(workspace => (
                            <WorkspaceCard
                                key={workspace.workspace_id}
                                workspace={workspace}
                            />
                        ))}

                    </div>

                </section>
            )}

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
                                key={workspace.workspace_id}
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