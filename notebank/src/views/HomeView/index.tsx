import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useNotesStore } from '../../stores/notes';

/**
 * HomeView component that displays recent notes
 * Uses the notes store directly instead of receiving props
 */
const HomeView: React.FC = () => {
  // Use individual selectors to prevent unnecessary re-renders
  const recentNotes = useNotesStore(state => state.getRecentNotes(5));
  const isLoading = useNotesStore(state => state.ui.isLoading);
  const error = useNotesStore(state => state.ui.error);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recent Notes</h1>
        <Link
          to="/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Note
        </Link>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && recentNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No notes yet. Create your first note!</p>
          <Link
            to="/new"
            className="inline-flex items-center px-4 py-2 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Note
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recentNotes.map((note) => (
            <Link
              key={note.id}
              to={`/notes/${note.id}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{note.title}</h2>
                  <p className="mt-1 text-gray-600 line-clamp-2">{note.content}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  {note.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeView; 