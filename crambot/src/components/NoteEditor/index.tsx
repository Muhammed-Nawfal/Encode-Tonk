import React, { useState, useCallback } from 'react';
import { useNoteStore, Note, NoteState } from '../../stores/noteStore';

interface NoteEditorProps {
  initialNote?: Partial<Note>;
  onSave?: (noteId: string) => void;
  onCancel?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialNote,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const addNote = useNoteStore((state: NoteState) => state.addNote);
  const updateNote = useNoteStore((state: NoteState) => state.updateNote);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const noteData = {
        title,
        content,
        tags,
      };

      if (initialNote?.id) {
        updateNote(initialNote.id, noteData);
        onSave?.(initialNote.id);
      } else {
        const newNote = addNote(noteData);
        onSave?.(newNote.id);
      }
    },
    [title, content, tags, initialNote?.id, updateNote, addNote, onSave]
  );

  const handleAddTag = useCallback(() => {
    if (tagInput.trim()) {
      setTags((prev) => [...new Set([...prev, tagInput.trim()])]);
      setTagInput('');
    }
  }, [tagInput]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700"
        >
          Tags
        </label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Add tags..."
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 inline-flex items-center p-0.5 hover:bg-blue-200 rounded-full"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {initialNote?.id ? 'Update' : 'Create'} Note
        </button>
      </div>
    </form>
  );
};

export default NoteEditor; 