import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TopMenu from "../components/TopMenuComponent";

import {
    createWorkspace
} from "../composites/useWorkspaceComposite";

export default function WorkspaceCreate() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [tags, setTags] = useState("");

    /**
     * CREATE WORKSPACE
     */
    const handleCreate = async () => {

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

        await createWorkspace({
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

    const canCreate =
        name.trim().length > 0 &&
        tags.trim().length > 0;

    return (
        <div className="p-4 flex flex-col gap-6">

            <TopMenu actions={menuActions} />

            <div className="text-xl font-bold">
                Create Workspace
            </div>

            <div className="text-sm opacity-70">
                A workspace is a saved collection of hashtags that opens together.
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
                    placeholder="Workspace name..."
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
                    placeholder="#notes #thoughts #ideas"
                    value={tags}
                    onChange={(e) =>
                        setTags(e.target.value)
                    }
                    spellCheck={false}
                />

            </div>

            <button
                className={`
                    btn w-full
                    ${canCreate
                        ? "btn-primary"
                        : "btn-disabled"}
                `}
                disabled={!canCreate}
                onClick={handleCreate}
            >
                Create Workspace
            </button>

        </div>
    );
}