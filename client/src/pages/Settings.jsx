import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import TopMenu from "../components/TopMenu";
import { getAllNotes, createNote } from "../hooks/useNotes";
import { useEffect, useState } from "react";

export default function Settings() {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);

    /**
     * LOAD FROM INDEXEDDB
     */
    useEffect(() => {
        const load = async () => {
            const data = await getAllNotes();
            setNotes(data);
        };

        load();
    }, []);

    /**
     * SANITIZE FILE NAME
     */
    const sanitize = (name) =>
        (name || "untitled")
            .replace(/[^a-z0-9\s]/gi, "")
            .trim();

    /**
     * EXPORT
     */
    const handleExport = async () => {
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
     * IMPORT
     */
    const handleImport = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target.result || "";

                const title = file.name
                    .replace(".txt", "")
                    .replace(/_/g, " ")
                    .trim();

                const now = Date.now();

                await createNote({
                    title: title || "Imported Note",
                    content: content.trim(),
                    createdAt: now,
                    updatedAt: now
                });
            };

            reader.readAsText(file);
        });

        alert("Import complete!");

        setTimeout(async () => {
            const updated = await getAllNotes();
            setNotes(updated);
        }, 300);
    };

    const menuActions = [
        {
            label: "Back",
            onClick: () => navigate("/")
        }
    ];

    const formatDate = (ts) => {
        if (!ts) return "";
        return new Date(ts).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="p-4 flex flex-col gap-6">

            <TopMenu actions={menuActions} />

            {/* LIST STYLE SETTINGS (like Home) */}
            <div className="flex flex-col gap-3">

                {/* EXPORT ROW */}
                <button
                    onClick={handleExport}
                    className="btn btn-outline w-full flex flex-col items-start text-left"
                >
                    <span className="font-medium">
                        Export Notes (.zip)
                    </span>

                    <span className="text-xs opacity-60">
                        Download all notes as individual .txt files inside a zip archive. Useful for backups or moving data between devices.
                    </span>
                </button>

                {/* IMPORT ROW */}
                <label className="btn btn-outline w-full flex flex-col items-start text-left cursor-pointer">
                    <span className="font-medium">
                        Import Notes (.txt files)
                    </span>

                    <span className="text-xs opacity-60">
                        Upload one or more .txt files and convert them into notes stored locally on this device.
                    </span>

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