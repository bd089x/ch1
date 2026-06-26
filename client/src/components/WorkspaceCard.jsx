import { useNavigate } from "react-router-dom";

export default function WorkspaceCard({
    workspace
}) {

    const navigate = useNavigate();

    return (

        <div className="border border-neutral-800 rounded-lg p-3">

            <div className="flex justify-between items-start mb-3">

                <div>

                    <div className="font-medium">

                        {workspace.name}

                    </div>

                    <div className="text-xs text-neutral-500 mt-1">

                        {workspace.tags
                            .map(tag => `#${tag}`)
                            .join(" ")}

                    </div>

                </div>

                <div className="flex gap-3">

                    <button
                        className="text-blue-400 text-sm"
                        onClick={() =>
                            navigate(
                                `/workspace/update/${workspace.id}`
                            )
                        }
                    >
                        Edit
                    </button>

                    <button
                        className="text-red-400 text-sm"
                        onClick={() =>
                            navigate(
                                `/workspace/delete/${workspace.id}`
                            )
                        }
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
                onClick={() =>
                    navigate(
                        `/editor/${workspace.tags.join(",")}`
                    )
                }
            >
                Open Workspace
            </button>

        </div>

    );

}