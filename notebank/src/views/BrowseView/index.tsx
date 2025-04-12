import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag, Plus } from 'lucide-react';
import { useNotesStore } from '../../stores/notes';


// Define types
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

type TagColorClass = string;

const BrowseView = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Use individual selectors to prevent unnecessary re-renders
  const notes = useNotesStore(state => state.data.notes) as Note[];
  const isLoading = useNotesStore(state => state.ui.isLoading) as boolean;
  const error = useNotesStore(state => state.ui.error) as string | null;

  // Get unique tags from all notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter notes based on search term and selected tag
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch = searchTerm
          ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
          : true;

      const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;

      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, selectedTag]);

  // Function to get a consistent color for tags
  const getTagColor = (tag: string): TagColorClass => {
    // Simple hash function to generate a color based on tag name
    const hash = tag.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[hash % colors.length];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg border-r border-gray-100 min-h-screen p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">NoteBank</h1>

          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filter by Tag</h2>
            <select
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Browse Notes</h1>
              <Link
                  to="/new"
                  className="inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Note
              </Link>
            </div>

            {/* Search bar (without the right filter) */}
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search notes..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading your notes...</p>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredNotes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                  <Tag className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-xl font-medium text-gray-900">No notes found</h3>
                  <p className="mt-2 text-gray-500 max-w-md mx-auto">
                    {searchTerm || selectedTag
                        ? 'Try adjusting your search or filter to find what you\'re looking for.'
                        : 'Get started by creating a new note to capture your thoughts.'}
                  </p>
                  {!searchTerm && !selectedTag && (
                      <div className="mt-6">
                        <Link
                            to="/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create Your First Note
                        </Link>
                      </div>
                  )}
                </div>
            ) : (
                /* Note grid */
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredNotes.map((note) => (
                      <Link
                          key={note.id}
                          to={`/notes/${note.id}`}
                          className="block p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 h-56 flex flex-col"
                      >
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate hover:text-blue-600 transition-colors duration-200">
                            {note.title}
                          </h2>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{note.content}</p>
                        </div>

                        <div className="mt-auto">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {note.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                                >
                          {tag}
                        </span>
                            ))}
                          </div>
                          <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {formatDate(note.updatedAt)}
                      </span>
                          </div>
                        </div>
                      </Link>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default BrowseView;