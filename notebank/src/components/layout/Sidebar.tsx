import React from 'react';

interface SidebarProps {
    allTags: string[];
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ allTags, selectedTag, setSelectedTag }) => {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <nav className="mt-5 px-2">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Filter by Tag</h2>
                <select
                    value={selectedTag || ''}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">All Tags</option>
                    {allTags.map((tag) => (
                        <option key={tag} value={tag}>
                            {tag}
                        </option>
                    ))}
                </select>
            </nav>
        </aside>
    );
};

export default Sidebar;