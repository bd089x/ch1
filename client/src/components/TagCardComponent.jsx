import { useNavigate } from "react-router-dom";

export default function TagCard({
    tag,
    count
}) {

    const navigate = useNavigate();

    return (

        <div className="border border-neutral-800 rounded-lg p-3">

            <div className="flex justify-between items-center">

                <div>

                    <div className="font-medium">

                        #{tag}

                    </div>

                    <div className="text-xs text-neutral-500 mt-1">

                        {count} {count === 1 ? "note" : "notes"}

                    </div>

                </div>

                <button
                    className="
                        btn
                        btn-outline
                        btn-sm
                    "
                    onClick={() =>
                        navigate(`/editor/${tag}`)
                    }
                >
                    Open
                </button>

            </div>

        </div>

    );

}