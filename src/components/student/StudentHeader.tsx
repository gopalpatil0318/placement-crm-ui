"use client";

import {
    Menu,
    Search,
    Sun,
    Sliders,
    Settings,
    Zap,
    Bell,
} from "lucide-react";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="w-full h-16 bg-white border-b flex items-center justify-between px-6">
            {/* LEFT */}
            <div className="flex items-center gap-4">
                {/* Hamburger */}
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Menu size={20} className="text-gray-600" />
                </button>

                {/* Search */}
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Ctrl + K"
                        className="pl-9 pr-4 py-2 w-64 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
                <IconButton>
                    <Sun size={18} />
                </IconButton>

                <IconButton>
                    <Sliders size={18} />
                </IconButton>

                <IconButton>
                    <Settings size={18} />
                </IconButton>

                <IconButton>
                    <Zap size={18} />
                </IconButton>

                {/* Notification */}
                <div className="relative">
                    <IconButton>
                        <Bell size={18} />
                    </IconButton>
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                        3
                    </span>
                </div>

                {/* Avatar */}
                <div className="ml-2">
                    <img
                        src="https://i.pravatar.cc/40?u=student"
                        alt="Student"
                        className="h-9 w-9 rounded-full border"
                    />
                </div>
            </div>
        </header>
    );
}

function IconButton({ children }: { children: React.ReactNode }) {
    return (
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            {children}
        </button>
    );
}