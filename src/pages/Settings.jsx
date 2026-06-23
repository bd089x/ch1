import { createNote } from "../hooks/useNotes";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import TopMenu from "../components/TopMenu";

export default function Settings() {
    const navigate = useNavigate();

    /**
     * ALWAYS FRESH READ (fixes blank export)
     */
    function loadNotesFresh() {
        const raw = localStorage.getItem("chalk-notes");
        return raw ? JSON.parse(raw) : [];
    }

    /**
     * SANITIZE FILE NAME
     */
    const sanitize = (name) =>
        (name || "untitled")
            .replace(/[^a-z0-9\s]/gi, "")
            .trim();

    /**
     * EXPORT: ONE FILE PER NOTE
     */
    const handleExport = async () => {
        const notes = loadNotesFresh();
        const zip = new JSZip();

        const nameCount = {};

        notes.forEach(note => {
            let baseName = sanitize(note.title).toLowerCase() || "untitled";

            if (!nameCount[baseName]) {
                nameCount[baseName] = 0;
            } else {
                nameCount[baseName] += 1;
            }

            const suffix =
                nameCount[baseName] === 0
                    ? ""
                    : ` (${nameCount[baseName]})`;

            const filename = `${baseName}${suffix}.txt`;

            zip.file(filename, note.content || "");
        });

        const blob = await zip.generateAsync({ type: "blob" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "chalk-notes.zip";
        a.click();

        URL.revokeObjectURL(url);
    };

    /**
     * IMPORT FILES
     */
    const handleImport = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result || "";

                const title = file.name
                    .replace(".txt", "")
                    .replace(/_/g, " ")
                    .trim();

                const now = Date.now();

                createNote({
                    title: title || "Imported Note",
                    content: content.trim(),
                    createdAt: now,
                    updatedAt: now
                });
            };

            reader.readAsText(file);
        });

        alert("Import complete!");
    };

    const menuActions = [
        {
            label: "Back",
            onClick: () => navigate("/")
        }
    ];

    return (
        <div className="p-4 flex flex-col gap-6">

            {/* Top Menu (Back only) */}
            <TopMenu actions={menuActions} />

            {/* Centered Actions */}
            <div className="flex flex-col items-center gap-4 w-full">

                {/* Export */}
                <button
                    className="btn btn-primary w-full max-w-md"
                    onClick={handleExport}
                >
                    Export Notes (.zip)
                </button>

                {/* Import */}
                <label className="btn btn-outline w-full max-w-md cursor-pointer text-center">
                    Import Notes (.txt files)
                    <input
                        type="file"
                        accept=".txt"
                        multiple
                        className="hidden"
                        onChange={handleImport}
                    />
                </label>

            </div>

        </div>
    );
}