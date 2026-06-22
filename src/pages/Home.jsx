import { useNavigate } from "react-router-dom";
import { getAllNotes, createNote } from "../hooks/useNotes";
import TopMenu from "../components/TopMenu";

export default function Home() {
    const navigate = useNavigate();
    const notes = getAllNotes();

    const handleNewNote = () => {
        const note = createNote();
        navigate(`/note/${note.id}`);
    };

    const menuActions = [
        {
            label: "New",
            onClick: handleNewNote
        },
        {
            label: "Home",
            onClick: () => navigate("/")
        }
    ];

    return (
        <div className="w-full p-4">

            <TopMenu actions={menuActions} />

            <div className="flex flex-col gap-2">

                {notes.map(note => {

                    const title = note.title?.trim() || "Untitled";

                    const preview =
                        note.content?.split("\n")[0]?.trim() || "";

                    return (
                        <button
                            key={note.id}
                            className="btn btn-outline w-full justify-start flex flex-col items-start"
                            onClick={() => navigate(`/note/${note.id}`)}
                        >
                            <span className="font-medium">
                                {title}
                            </span>

                            {preview && (
                                <span className="text-xs opacity-60">
                                    {preview}
                                </span>
                            )}
                        </button>
                    );
                })}

            </div>

        </div>
    );
}