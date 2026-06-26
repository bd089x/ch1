import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopMenu from "../components/TopMenu";

import {
    getAllTags,
    createNote
} from "../hooks/useNotes";

import { useLoading } from "../context/LoadingContext";

export default function Home() {

    const navigate = useNavigate();

    const {
        showLoading,
        hideLoading
    } = useLoading();

    const [tags, setTags] = useState([]);

    const loadTags = async () => {

        showLoading("Loading workspaces...");

        try {

            const data = await getAllTags();

            setTags(data);

        } finally {

            hideLoading();

        }

    };

    useEffect(() => {
        loadTags();
    }, []);

    const handleNew = async () => {

        showLoading("Creating inbox note...");

        try {

            await createNote({

                note_content:
`#inbox

`

            });

            await loadTags();

            navigate("/editor/inbox");

        } finally {

            hideLoading();

        }

    };

    const menuActions = [

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

        <div className="w-full p-4">

            <TopMenu actions={menuActions} />

            <div className="flex flex-col gap-2">

                {tags.map(({ tag, count }) => (

                    <button
                        key={tag}
                        className="
                            btn
                            btn-outline
                            w-full
                            justify-between
                        "
                        onClick={() =>
                            navigate(`/editor/${tag}`)
                        }
                    >

                        <span>
                            #{tag}
                        </span>

                        <span className="opacity-60">
                            {count}
                        </span>

                    </button>

                ))}

                {tags.length === 0 && (

                    <div className="text-center opacity-50 py-12">

                        No workspaces yet.

                        <br />

                        Press <strong>New</strong> to create your first note.

                    </div>

                )}

            </div>

        </div>

    );

}