import { Menu, Bell } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="w-full h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={20} className="text-gray-600" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                    </button>
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                        3
                    </span>
                </div>
            </div>
        </header>
    );
}
