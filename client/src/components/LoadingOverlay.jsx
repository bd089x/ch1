import { useLoading } from "../context/LoadingContext";

export default function LoadingOverlay() {
    const { loading, message } = useLoading();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <div className="flex flex-col items-center gap-4 rounded-xl bg-base-200 px-8 py-6 shadow-xl">

                <span className="loading loading-spinner loading-lg"></span>

                <span className="text-lg font-medium">
                    {message}
                </span>

            </div>

        </div>
    );
}