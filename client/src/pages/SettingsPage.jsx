import { useNavigate } from "react-router-dom";
import TopMenu from "../components/TopMenuComponent";
import { useEffect, useState } from "react";
import { useLoading } from "../context/LoadingContext";

import {
    exportAccount,
    importAccount
} from "../composites/useAccountComposite";

const BUILD_TIME = __BUILD_TIME__;

export default function Settings() {

    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [notes, setNotes] = useState([]);

    /**
     * LOAD NOTES (optional stats/debug via export snapshot)
     */
    useEffect(() => {

        const load = async () => {

            showLoading("Loading settings...");

            try {
                const data = await exportAccount();

                setNotes(data?.notes || []);
            } finally {
                hideLoading();
            }

        };

        load();

    }, []);

    /**
     * FORMAT BUILD TIME
     */
    const formatBuildTime = (iso) => {

        if (!iso) return "";

        return new Date(iso).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    };

    const formatFileTimestamp = (date = new Date()) => {

    const pad = (n) => String(n).padStart(2, "0");

    return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())}_` +
        `${pad(date.getHours())}-` +
        `${pad(date.getMinutes())}-` +
        `${pad(date.getSeconds())}`
    );

    };

    /**
     * EXPORT FULL ACCOUNT DATA (notes + workspaces)
     */
    const handleExport = async () => {

        showLoading("Exporting account...");

        try {

            const data = await exportAccount();

            const blob = new Blob(
                [JSON.stringify(data, null, 2)],
                { type: "application/json" }
            );

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `chalk-account-backup-${formatFileTimestamp()}.json`;
            a.click();

            URL.revokeObjectURL(url);

        } finally {
            hideLoading();
        }

    };

    /**
     * IMPORT FULL ACCOUNT DATA
     */
    const handleImport = async (event) => {

        showLoading("Importing account...");

        const file = event.target.files?.[0];

        if (!file) {
            hideLoading();
            return;
        }

        try {

            const text = await file.text();

            let parsed;

            try {
                parsed = JSON.parse(text);
            } catch {
                throw new Error("Invalid backup file");
            }

            await importAccount(parsed);

            navigate("/");

        } finally {

            hideLoading();

            // allow re-import of same file
            event.target.value = "";

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
                    className="
                        btn btn-outline
                        w-full
                        flex flex-col
                        items-start
                        text-left
                    "
                >
                    <span className="font-medium">
                        Export Account
                    </span>

                    <span className="text-xs opacity-60">
                        Download full account backup including notes and workspaces.
                    </span>
                </button>

                {/* IMPORT */}
                <label
                    className="
                        btn btn-outline
                        w-full
                        flex flex-col
                        items-start
                        text-left
                        cursor-pointer
                    "
                >
                    <span className="font-medium">
                        Import Account
                    </span>

                    <span className="text-xs opacity-60">
                        Restore full backup including notes and workspaces.
                    </span>

                    <input
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={handleImport}
                    />
                </label>

                {/* RESET */}
                <button
                    onClick={() => navigate("/reset")}
                    className="
                        btn btn-outline
                        w-full
                        flex flex-col
                        items-start
                        text-left
                        border-red-500/50
                        hover:border-red-500
                    "
                >
                    <span className="font-medium text-red-500">
                        Reset App
                    </span>

                    <span className="text-xs opacity-60">
                        Permanently delete all account data and restore clean state.
                    </span>
                </button>

            </div>

            {/* BUILD INFO */}
            <div className="text-xs opacity-40 text-center pt-6">
                Built: {formatBuildTime(BUILD_TIME)}
            </div>

        </div>
    );
}