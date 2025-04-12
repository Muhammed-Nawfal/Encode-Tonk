import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit, ArrowLeft, Tag } from "lucide-react";

interface Note {
    id: string;
    title: string;
    content?: string;
    updatedAt: Date;
    tags: string[];
}

interface NoteViewProps {
    notes: Note[];
}

const NoteView: React.FC<NoteViewProps> = ({ notes }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Find the note with the matching ID
    const note = notes.find(note => note.id === id);

    // Handle case where note is not found
    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Note not found</h2>
                <p className="text-gray-600 mb-6">The note you're looking for doesn't exist or was deleted.</p>
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Notes
                </button>
            </div>
        );
    }

    // Formatting the date
    const formattedDate = note.updatedAt.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    // Tag color function (simplified for this example)
    const getTagColor = (tag: string): string => {
        const colors = [
            "bg-blue-100 text-blue-800",
            "bg-green-100 text-green-800",
            "bg-purple-100 text-purple-800",
            "bg-yellow-100 text-yellow-800",
            "bg-pink-100 text-pink-800"
        ];
        const hash = tag.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        return colors[hash % colors.length];
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Navigation and actions */}
            <div className="mb-6 flex items-center justify-between">
                <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Notes
                </Link>
                <Link
                    to={`/notes/${note.id}/edit`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Note
                </Link>
            </div>

            {/* Note content */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{note.title}</h1>

                {/* Tags */}
                {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.map(tag => (
                            <span
                                key={tag}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
                            >
                <Tag className="w-4 h-4 mr-1" />
                                {tag}
              </span>
                        ))}
                    </div>
                )}

                {/* Last updated timestamp */}
                <div className="text-sm text-gray-500 mb-6">
                    Last updated: {formattedDate}
                </div>

                {/* Note content */}
                <div className="prose max-w-none">
                    {note.content ? (
                        <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                    ) : (
                        <p className="text-gray-500 italic">No content</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteView;