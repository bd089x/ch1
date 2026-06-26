import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TopMenu from "../components/TopMenu";

import {
    getWorkspace,
    updateWorkspace
} from "../utils/WorkspaceUtil";

export default function WorkspaceUpdate() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [tags, setTags] = useState("");

    useEffect(() => {

        const workspace = getWorkspace(id);

        if (!workspace) return;

        setName(workspace.name);

        setTags(
            workspace.tags
                .map(tag => `#${tag}`)
                .join(" ")
        );

    }, [id]);

    const handleSave = () => {

        const workspaceName = name.trim();

        if (!workspaceName) return;

        const tagList = tags
            .split(/[,\s]+/)
            .map(tag =>
                tag
                    .replace(/^#/, "")
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);

        if (!tagList.length) return;

        updateWorkspace(id, {
            name: workspaceName,
            tags: tagList
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
        name.trim().length > 0 &&
        tags.trim().length > 0;

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
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
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
                    value={tags}
                    onChange={(e) =>
                        setTags(e.target.value)
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