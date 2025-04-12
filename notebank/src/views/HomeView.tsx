import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface HomeViewProps {
    recentNotes: { id: string; title: string; updatedAt: Date; tags: string[] }[];
}

const HomeView: React.FC<HomeViewProps> = ({ }) => {
    return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
        <Link
          to="/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-1" />
          New Note
        </Link>
      </div>

      {/* Empty state */}
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new note
        </p>
        <div className="mt-6">
          <Link
            to="/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-1" />
            New Note
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeView; 