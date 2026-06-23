import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TopMenu from "../components/TopMenu";
import { deleteAllNotes } from "../hooks/useNotes";
import { useLoading } from "../context/LoadingContext";

export default function Reset() {
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [confirmText, setConfirmText] = useState("");

    const RESET_PHRASE = "DELETE ALL";

    /**
     * RESET ACTION
     */
    const handleReset = async () => {
        if (confirmText !== RESET_PHRASE) return;

        showLoading("Deleting all notes...");

        try {
            await deleteAllNotes();
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

    const canReset = confirmText === RESET_PHRASE;

    return (
        <div className="p-4 flex flex-col gap-6">

            <TopMenu actions={menuActions} />

            {/* Title */}
            <div className="text-xl font-bold text-red-500">
                Reset Application
            </div>

            {/* Warning */}
            <div className="text-sm opacity-70">
                This will permanently delete all notes on this device.
                This action cannot be undone.
            </div>

            {/* Confirmation instruction */}
            <div className="text-sm opacity-70">
                Type <span className="font-bold text-white">DELETE ALL</span> to confirm.
            </div>

            {/* Input */}
            <input
                className="
                    w-full
                    p-3
                    bg-black
                    border
                    border-neutral-700
                    text-white
                    rounded-lg
                "
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type confirmation phrase..."
            />

            {/* Reset Button */}
            <button
                className={`
                    btn w-full
                    ${canReset ? "btn-error" : "btn-disabled"}
                `}
                disabled={!canReset}
                onClick={handleReset}
            >
                Reset All Data
            </button>

        </div>
    );
}