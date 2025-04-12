import React, { useState, useCallback, useEffect } from 'react';
import { useNoteStore, Note, AICard as AICardType } from './stores/noteStore';
import { aiService } from './modules/core/aiService';
import NoteEditor from './components/NoteEditor';
import AICard from './components/AICard';

type AIOutputType = 'summary' | 'flashcard' | 'revision';

const App: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<AIOutputType>('summary');
  const [currentAICard, setCurrentAICard] = useState<AICardType | null>(null);

  const { notes, aiCards, addAICard, deleteNote, deleteAICard } = useNoteStore();

  // Get all unique tags from notes
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [notes]);

  // Filter notes based on selected tag
  const filteredNotes = React.useMemo(() => {
    if (!selectedTag) return notes;
    return notes.filter(note => note.tags.includes(selectedTag));
  }, [notes, selectedTag]);

  const handleProcessNote = useCallback(async (noteId: string, type: AIOutputType) => {
    const note = notes.find((n: Note) => n.id === noteId);
    if (!note) return;

    setIsProcessing(true);
    setCurrentAICard(null);
    
    try {
      // Generate content based on selected type
      const result = await aiService.processNote(note, { type });
      
      // Create our AICard manually so we can use it immediately
      const newCard: AICardType = {
        ...result,
        id: crypto.randomUUID(),
      };
      
      // Add to store
      addAICard(result);
      
      // Set as current card
      setCurrentAICard(newCard);
    } catch (error) {
      console.error(`Error processing note for ${type}:`, error);
      // TODO: Add proper error handling
    } finally {
      setIsProcessing(false);
    }
  }, [notes, addAICard]);

  const handleDeleteNote = useCallback((noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
      if (selectedNote === noteId) {
        setSelectedNote(null);
        setCurrentAICard(null);
      }
    }
  }, [deleteNote, selectedNote]);

  const handleDeleteAICard = useCallback((cardId: string) => {
    if (window.confirm('Are you sure you want to delete this AI card?')) {
      deleteAICard(cardId);
      if (currentAICard && currentAICard.id === cardId) {
        setCurrentAICard(null);
      }
    }
  }, [deleteAICard, currentAICard]);

  // When user selects a note, also clear current AI card
  const handleSelectNote = (noteId: string) => {
    setSelectedNote(noteId);
    setCurrentAICard(null);
  };

  return (
    <div className="min-h-screen bg-[#ffeedd] flex flex-col text-base">
      <header className="bg-gradient-to-r from-[#8b597b] to-[#9d6a8c] shadow-md">
        <div className="w-full py-8 px-4 sm:px-5">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h1 className="text-5xl font-extrabold tracking-tight text-white -ml-2">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mr-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Crambot
              </span>
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="px-7 py-4 bg-white text-[#8b597b] border-2 border-white rounded-full shadow-md text-lg font-semibold hover:bg-[#ffeedd]/90 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#8b597b]"
            >
              New Note
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex">
        {isEditing ? (
          <div className="relative bg-white shadow-lg rounded-2xl p-8 max-w-7xl mx-auto mt-8 w-full m-6 border border-[#efa3a0]/20 text-[#493129] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-[#efa3a0]/5 before:to-transparent before:content-['']">
            <NoteEditor
              onSave={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="flex-1 flex p-6 gap-6 h-[calc(100vh-9rem)]">
            {/* Left Sidebar */}
            <div className="relative w-[32rem] bg-white rounded-3xl shadow-lg p-8 overflow-y-auto flex flex-col border border-[#efa3a0]/20 text-[#493129] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-[#efa3a0]/5 before:to-transparent before:content-['']">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#493129] mb-6 border-b border-[#efa3a0]/20 pb-2">Filter Notes</h2>
                <div className="mb-6">
                  <label className="block text-xl font-medium text-[#8b597b] mb-3">
                    By Tag
                  </label>
                  <select 
                    className="w-full rounded-xl border-[#efa3a0]/20 shadow-sm focus:border-[#8b597b] focus:ring-[#8b597b] py-3 text-lg bg-[#ffeedd]/50 text-[#493129] transition-all duration-200"
                    value={selectedTag || ''}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                  >
                    <option value="">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-8">
                  <label className="block text-xl font-medium text-[#8b597b] mb-3">
                    Select Note
                  </label>
                  <select 
                    className="w-full rounded-xl border-[#efa3a0]/20 shadow-sm focus:border-[#8b597b] focus:ring-[#8b597b] py-3 text-lg bg-[#ffeedd]/50 text-[#493129] transition-all duration-200"
                    value={selectedNote || ''}
                    onChange={(e) => handleSelectNote(e.target.value)}
                  >
                    <option value="">Select a note</option>
                    {filteredNotes.map(note => (
                      <option key={note.id} value={note.id}>{note.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-[#493129] mb-6 border-b border-[#efa3a0]/20 pb-2">Your Notes</h2>
                <div className="space-y-5 max-h-[calc(100vh-42rem)] overflow-y-auto mb-8">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`group p-6 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedNote === note.id 
                          ? 'bg-gradient-to-br from-[#efa3a0]/20 to-[#ffeedd]/80 border-2 border-[#8b597b]/40 shadow-sm' 
                          : 'bg-[#ffeedd]/50 hover:bg-[#ffeedd]/70 border border-[#efa3a0]/20'
                      }`}
                      onClick={() => handleSelectNote(note.id)}
                    >
                      <h3 className="text-xl font-medium leading-tight text-[#493129]">{note.title}</h3>
                      <p className="mt-3 text-lg text-[#493129]/80 line-clamp-2 leading-relaxed">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#8b597b]/20 text-[#8b597b] border border-[#8b597b]/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="text-base text-[#8b597b] hover:text-[#493129] transition-colors duration-200 font-medium hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredNotes.length === 0 && (
                  <div className="text-center py-10 bg-[#ffeedd]/50 rounded-xl border border-[#efa3a0]/20 text-[#493129]/70 mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#efa3a0] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-xl font-medium">No notes found</p>
                  </div>
                )}
              </div>
              
              {/* AI Output Format Selection */}
              <div className="mt-auto pt-6 border-t border-[#efa3a0]/20">
                <div className="mb-6">
                  <label className="block text-xl font-medium text-[#8b597b] mb-4">
                    AI Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className={`flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer transition-all duration-200 ${outputType === 'summary' ? 'bg-gradient-to-b from-[#efa3a0]/20 to-[#ffeedd]/80 border-2 border-[#8b597b]/40 text-[#493129] shadow-sm' : 'bg-[#ffeedd]/50 border border-[#efa3a0]/20 hover:bg-[#ffeedd]/70 text-[#493129]/80'}`}>
                      <input
                        type="radio"
                        className="hidden"
                        name="outputType"
                        value="summary"
                        checked={outputType === 'summary'}
                        onChange={() => setOutputType('summary')}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 text-[#8b597b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-lg">Summary</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer transition-all duration-200 ${outputType === 'flashcard' ? 'bg-gradient-to-b from-[#efa3a0]/20 to-[#ffeedd]/80 border-2 border-[#8b597b]/40 text-[#493129] shadow-sm' : 'bg-[#ffeedd]/50 border border-[#efa3a0]/20 hover:bg-[#ffeedd]/70 text-[#493129]/80'}`}>
                      <input
                        type="radio"
                        className="hidden"
                        name="outputType"
                        value="flashcard"
                        checked={outputType === 'flashcard'}
                        onChange={() => setOutputType('flashcard')}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 text-[#8b597b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span className="text-lg">Flashcards</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-5 rounded-xl cursor-pointer transition-all duration-200 ${outputType === 'revision' ? 'bg-gradient-to-b from-[#efa3a0]/20 to-[#ffeedd]/80 border-2 border-[#8b597b]/40 text-[#493129] shadow-sm' : 'bg-[#ffeedd]/50 border border-[#efa3a0]/20 hover:bg-[#ffeedd]/70 text-[#493129]/80'}`}>
                      <input
                        type="radio"
                        className="hidden"
                        name="outputType"
                        value="revision"
                        checked={outputType === 'revision'}
                        onChange={() => setOutputType('revision')}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 text-[#8b597b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-lg">Revision</span>
                    </label>
                  </div>
                </div>
                
                {selectedNote && (
                  <button
                    onClick={() => handleProcessNote(selectedNote, outputType)}
                    disabled={isProcessing}
                    className="w-full px-6 py-5 bg-gradient-to-r from-[#8b597b] to-[#efa3a0] text-white rounded-xl shadow-md text-lg font-semibold transition-all duration-200 ease-in-out transform hover:translate-y-[-2px] disabled:opacity-50 disabled:transform-none disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#efa3a0]"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : 'Generate Content'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="relative flex-1 bg-white rounded-3xl shadow-lg p-8 overflow-y-auto border border-[#efa3a0]/20 text-[#493129] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-[#efa3a0]/5 before:to-transparent before:content-['']">
              <h2 className="text-3xl font-bold mb-6 text-[#493129] border-b border-[#efa3a0]/20 pb-3">
                {currentAICard ? 'AI-Generated Content' : 'Content Preview'}
              </h2>
              
              {currentAICard ? (
                <div className="bg-[#ffeedd]/50 rounded-xl shadow-sm border border-[#efa3a0]/20 p-8 mb-8 min-h-[calc(100vh-22rem)]">
                  <AICard
                    card={currentAICard}
                    onDelete={() => handleDeleteAICard(currentAICard.id)}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#ffeedd]/80 to-[#efa3a0]/10 rounded-xl border border-[#efa3a0]/20 p-10 text-center text-[#493129]/80 min-h-[calc(100vh-22rem)] flex items-center justify-center mb-8">
                  <div className="max-w-lg">
                    {/* Light Bulb Icon in a Sunset Shape */}
                    <div className="relative mx-auto w-32 h-32 mb-6">
                      <div className="absolute inset-0 rounded-full bg-[#efa3a0]/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[#efa3a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-2xl font-medium text-[#8b597b] leading-relaxed">
                      {selectedNote 
                        ? "Select an output format and click 'Generate Content' to see results here"
                        : "Select a note from the sidebar to get started"}
                    </p>
                  </div>
                </div>
              )}
              
              {/* History of Generated Content */}
              {aiCards.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-[#493129] border-b border-[#efa3a0]/20 pb-2">Recently Generated Content</h3>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {aiCards.slice(0, 6).map((card) => (
                      <div
                        key={card.id}
                        className={`group bg-[#ffeedd]/50 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                          currentAICard?.id === card.id ? 'border-[#8b597b] ring-1 ring-[#8b597b]/30' : 'border-[#efa3a0]/20'
                        }`}
                        onClick={() => setCurrentAICard(card)}
                      >
                        <div className="rounded-t-xl bg-gradient-to-r from-[#efa3a0]/20 to-[#ffeedd]/50 px-5 py-3 flex justify-between items-start">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#8b597b]/20 text-[#8b597b] border border-[#8b597b]/10">
                            {card.type}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAICard(card.id);
                            }}
                            className="text-[#493129]/40 hover:text-[#8b597b] transition-colors duration-200 text-lg opacity-0 group-hover:opacity-100"
                          >
                            &times;
                          </button>
                        </div>
                        <div className="p-5">
                          <p className="text-lg text-[#493129] line-clamp-2 leading-relaxed">{card.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
