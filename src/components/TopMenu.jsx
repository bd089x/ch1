export default function TopMenu({ actions = [] }) {
    return (
        <div className="w-full overflow-x-auto border-b border-neutral-800 pb-2 mb-4">

            <div className="flex gap-2 min-w-max justify-end">

                {actions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={action.onClick}
                        className="
                            btn btn-sm btn-outline
                            whitespace-nowrap
                            flex-shrink-0
                        "
                    >
                        {action.label}
                    </button>
                ))}

            </div>

        </div>
    );
}