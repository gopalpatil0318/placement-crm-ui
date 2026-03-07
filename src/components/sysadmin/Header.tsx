import { Menu } from "lucide-react";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="w-full h-16 bg-white border-b flex items-center px-6 shrink-0">
      <button
        type="button"
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} className="text-gray-600" />
      </button>
    </header>
  );
}
