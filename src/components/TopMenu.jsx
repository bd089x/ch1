export default function TopMenu({ actions = [] }) {
    return (
        <div className="w-full overflow-x-auto border-b border-neutral-800 pb-2 mb-4">

            <div className="flex items-center justify-end gap-2 min-w-max">

                {actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2">

                        <button
                            onClick={action.onClick}
                            className="
                                btn btn-sm btn-outline
                                whitespace-nowrap
                                flex-shrink-0
                            "
                        >
                            {action.label}
                        </button>

                        {/* separator (not after last item) */}
                        {idx !== actions.length - 1 && (
                            <span className="text-neutral-600 select-none">
                                |
                            </span>
                        )}

                    </div>
                ))}

            </div>

        </div>
    );
}