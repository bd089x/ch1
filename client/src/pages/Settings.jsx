import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import TopMenu from "../components/TopMenu";
import { getAllNotes, createNote } from "../hooks/useNotes";
import { useEffect, useState } from "react";
import { useLoading } from "../context/LoadingContext";

export default function Settings() {
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [notes, setNotes] = useState([]);

    /**
     * LOAD FROM INDEXEDDB
     */
    useEffect(() => {
        const load = async () => {
            showLoading("Loading settings...");

            try {
                const data = await getAllNotes();
                setNotes(data);
            } finally {
                hideLoading();
            }
        };

        load();
    }, []);

    /**
     * SANITIZE FILE NAME
     */
    const sanitize = (name) =>
        (name || "Untitled")
            .replace(/[^a-z0-9\s]/gi, "")
            .trim();

    /**
     * CREATE ZIP TIMESTAMP
     */
    const getTimestamp = () => {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    };

    /**
     * EXPORT
     */
    const handleExport = async () => {
        showLoading("Exporting notes...");

        try {
            const zip = new JSZip();
            const nameCount = {};

            notes.forEach(note => {
                const originalName = sanitize(note.note_title) || "Untitled";

                const key = originalName.toLowerCase();

                if (!(key in nameCount)) {
                    nameCount[key] = 0;
                } else {
                    nameCount[key]++;
                }

                const suffix =
                    nameCount[key] === 0
                        ? ""
                        : ` (${nameCount[key]})`;

                const filename = `${originalName}${suffix}.txt`;

                zip.file(filename, note.note_content || "");
            });

            const blob = await zip.generateAsync({ type: "blob" });

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `chalk-notes-${getTimestamp()}.zip`;
            a.click();

            URL.revokeObjectURL(url);
        } finally {
            hideLoading();
        }
    };

    /**
     * IMPORT
     */
    const handleImport = async (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        showLoading("Importing notes...");

        try {
            await Promise.all(
                files.map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();

                        reader.onload = async (e) => {
                            const content = e.target.result || "";

                            const title = file.name
                                .replace(/\.txt$/i, "")
                                .replace(/_/g, " ")
                                .trim();

                            await createNote({
                                note_title: title || "Imported Note",
                                note_content: content.trim()
                            });

                            resolve();
                        };

                        reader.readAsText(file);
                    });
                })
            );

            const updated = await getAllNotes();
            setNotes(updated);

            navigate("/");
        } finally {
            hideLoading();
        }
    };

    const menuActions = [
        {
            label: "Back",
            onClick: () => navigate("/")
        }
    ];

    return (
        <div className="p-4 flex flex-col gap-6">

            <TopMenu actions={menuActions} />

            <div className="flex flex-col gap-3">

                {/* EXPORT */}
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

                {/* IMPORT */}
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

                {/* RESET */}
                <button
                    onClick={() => navigate("/reset")}
                    className="btn btn-outline w-full flex flex-col items-start text-left border-red-500/50 hover:border-red-500"
                >
                    <span className="font-medium text-red-500">
                        Reset App
                    </span>

                    <span className="text-xs opacity-60">
                        Permanently delete all notes and restore the app to a clean state. This action requires confirmation.
                    </span>
                </button>

            </div>

        </div>
    );
}