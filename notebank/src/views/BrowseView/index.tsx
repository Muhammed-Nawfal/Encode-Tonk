import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Tag, Plus } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content?: string;
  updatedAt: Date;
  tags: string[];
}

interface BrowseViewProps {
  notes: Note[];
  tags: string[];
}

const BrowseView: React.FC<BrowseViewProps> = ({ notes, tags }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter notes based on search term and selected tag
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch = searchTerm
          ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
          : true;

      const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;

      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, selectedTag]);

  // Function to get tag colors
  const getTagColor = (tag: string): string => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-yellow-100 text-yellow-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];
    const hash = tag.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
      <div className="container mx-auto p-6">
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

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Filter by Tag</h2>
              <select
                  value={selectedTag || ""}
                  onChange={(e) => setSelectedTag(e.target.value || null)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Search bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search notes..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Note grid */}
            {filteredNotes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Tag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No notes found</h3>
                  <p className="mt-2 text-gray-500 max-w-md mx-auto">
                    {searchTerm || selectedTag
                        ? "Try adjusting your search or filter to find what you're looking for."
                        : "Get started by creating a new note to capture your thoughts."}
                  </p>
                  {!searchTerm && !selectedTag && (
                      <div className="mt-6">
                        <Link
                            to="/new"
                            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create Your First Note
                        </Link>
                      </div>
                  )}
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredNotes.map((note) => (
                      // Changed link to point to the view route instead of edit
                      <Link
                          key={note.id}
                          to={`/notes/${note.id}`}
                          className="block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden h-56 flex flex-col"
                      >
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate hover:text-blue-600 transition-colors duration-200">
                              {note.title}
                            </h2>
                            {note.content && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                  {note.content}
                                </p>
                            )}
                          </div>

                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {note.tags.map((tag) => (
                                  <span
                                      key={tag}
                                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}
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