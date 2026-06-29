import { useNavigate } from "react-router-dom";

import {
    addRecentWorkspace
} from "../utils/SettingsUtil";

export default function WorkspaceCard({
    workspace
}) {
    const navigate = useNavigate();

    const formatDate = (timestamp) => {
        if (!timestamp) return "";

        return new Date(timestamp).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    /**
     * OPEN WORKSPACE
     */
    const handleOpenWorkspace = () => {

        addRecentWorkspace(workspace.workspace_id);

        navigate(
            `/editor/${(workspace.workspace_tags || []).join(",")}`
        );

    };

    /**
     * EDIT WORKSPACE
     */
    const handleEdit = () => {
        navigate(
            `/workspace/update/${workspace.workspace_id}`
        );
    };

    /**
     * DELETE WORKSPACE
     */
    const handleDelete = () => {
        navigate(
            `/workspace/delete/${workspace.workspace_id}`
        );
    };

    return (
        <div className="border border-neutral-800 rounded-lg p-3">

            <div className="flex justify-between items-start mb-3">

                <div>

                    <div className="font-medium">
                        {workspace.workspace_title}
                    </div>

                    <div className="text-xs text-neutral-500 mt-1">
                        {(workspace.workspace_tags || [])
                            .map(tag => `#${tag}`)
                            .join(" ")}
                    </div>

                    <div className="text-[11px] text-neutral-600 mt-2">
                        Updated {formatDate(workspace.workspace_updated_at)}
                    </div>

                </div>

                <div className="flex gap-3">

                    <button
                        className="text-blue-400 text-sm"
                        onClick={handleEdit}
                    >
                        Edit
                    </button>

                    <button
                        className="text-red-400 text-sm"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>

                </div>

            </div>

            <button
                className="
                    btn
                    btn-outline
                    w-full
                "
                onClick={handleOpenWorkspace}
            >
                Open Workspace
            </button>

        </div>
    );
}