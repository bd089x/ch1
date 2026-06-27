import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TopMenu from "../components/TopMenuComponent";

import {
    getWorkspace,
    deleteWorkspace
} from "../composites/useWorkspaceComposite";

export default function WorkspaceDelete() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState(null);
    const [confirmText, setConfirmText] = useState("");

    /**
     * LOAD WORKSPACE
     */
    useEffect(() => {

        const load = async () => {
            const data = await getWorkspace(id);
            setWorkspace(data);
        };

        load();

    }, [id]);

    /**
     * DELETE WORKSPACE
     */
    const handleDelete = async () => {

        if (!workspace) return;

        if (confirmText !== workspace.workspace_title) return;

        await deleteWorkspace(workspace.workspace_id);

        navigate("/");
    };

    const menuActions = [
        {
            label: "Back",
            onClick: () => navigate("/")
        }
    ];

    if (!workspace) {

        return (
            <div className="p-4">

                <TopMenu actions={menuActions} />

                <div className="mt-6 opacity-60">
                    Workspace not found.
                </div>

            </div>
        );
    }

    const canDelete =
        confirmText === workspace.workspace_title;

    return (
        <div className="p-4 flex flex-col gap-6">

            <TopMenu actions={menuActions} />

            <div>

                <div className="text-2xl font-bold">
                    Delete Workspace
                </div>

                <div className="mt-2 text-neutral-400">
                    This removes the saved workspace only.
                    <br />
                    Your notes will remain untouched.
                </div>

            </div>

            <div
                className="
                    rounded-xl
                    border
                    border-neutral-800
                    p-5
                    bg-neutral-950
                "
            >

                <div className="text-lg font-medium">
                    {workspace.workspace_title}
                </div>

                <div className="mt-3 text-sm text-neutral-400">
                    {(workspace.workspace_tags || [])
                        .map(tag => `#${tag}`)
                        .join(" ")}
                </div>

            </div>

            <div className="text-sm opacity-70">
                Type the workspace name to confirm.
            </div>

            <input
                className="
                    w-full
                    rounded-lg
                    border
                    border-neutral-700
                    bg-black
                    p-3
                    outline-none
                "
                value={confirmText}
                onChange={(e) =>
                    setConfirmText(e.target.value)
                }
                placeholder={workspace.workspace_title}
            />

            <button
                className={`
                    btn
                    w-full
                    ${canDelete
                        ? "btn-error"
                        : "btn-disabled"}
                `}
                disabled={!canDelete}
                onClick={handleDelete}
            >
                Delete Workspace
            </button>

        </div>
    );
}