"use client";

interface Option {
    id: string;
    name: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label?: string;
}

export default function MultiSelect({ options, selected, onChange, label }: MultiSelectProps) {
    const toggleOption = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter((item) => item !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className="space-y-2">
            {label && <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {options.map((option) => (
                    <label
                        key={option.id}
                        className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(option.id)}
                            onChange={() => toggleOption(option.id)}
                            className="size-4 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513] cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{option.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
