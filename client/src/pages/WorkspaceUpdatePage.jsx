import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TopMenu from "../components/TopMenuComponent";

import {
    getWorkspace,
    updateWorkspace
} from "../composites/useWorkspaceComposite";

export default function WorkspaceUpdate() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [workspaceTitle, setWorkspaceTitle] = useState("");
    const [workspaceTags, setWorkspaceTags] = useState("");

    /**
     * LOAD WORKSPACE
     */
    useEffect(() => {

        const load = async () => {
            const workspace = await getWorkspace(id);

            if (!workspace) return;

            setWorkspaceTitle(workspace.workspace_title);

            setWorkspaceTags(
                (workspace.workspace_tags || [])
                    .map(tag => `#${tag}`)
                    .join(" ")
            );
        };

        load();

    }, [id]);

    /**
     * SAVE WORKSPACE
     */
    const handleSave = async () => {

        const title = workspaceTitle.trim();
        if (!title) return;

        const tags = workspaceTags
            .split(/[,\s]+/)
            .map(tag =>
                tag
                    .replace(/^#/, "")
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);

        if (!tags.length) return;

        await updateWorkspace(id, {
            workspace_title: title,
            workspace_tags: tags
        });

        navigate("/");
    };

    const menuActions = [
        {
            label: "Back",
            onClick: () => navigate("/")
        }
    ];

    const canSave =
        workspaceTitle.trim().length > 0 &&
        workspaceTags.trim().length > 0;

    return (
        <div className="p-4 flex flex-col gap-6">

            <TopMenu actions={menuActions} />

            <div className="text-xl font-bold">
                Edit Workspace
            </div>

            <div className="text-sm opacity-70">
                Update the workspace name or its tag collection.
            </div>

            <div className="flex flex-col gap-4">

                <input
                    className="
                        w-full
                        p-3
                        bg-black
                        border
                        border-neutral-700
                        rounded-lg
                        text-white
                    "
                    value={workspaceTitle}
                    onChange={(e) =>
                        setWorkspaceTitle(e.target.value)
                    }
                />

                <textarea
                    className="
                        w-full
                        min-h-32
                        p-3
                        bg-black
                        border
                        border-neutral-700
                        rounded-lg
                        text-white
                        resize-none
                    "
                    value={workspaceTags}
                    onChange={(e) =>
                        setWorkspaceTags(e.target.value)
                    }
                    spellCheck={false}
                />

            </div>

            <button
                className={`
                    btn
                    w-full
                    ${canSave
                        ? "btn-primary"
                        : "btn-disabled"}
                `}
                disabled={!canSave}
                onClick={handleSave}
            >
                Save Workspace
            </button>

        </div>
    );
}