import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import BrowseView from "./views/BrowseView";
import EditorView from "./views/EditorView";
import NoteView from "./views/NoteView"; // New import for the note viewing component

// Lazy load views for better performance
// const HomeView = React.lazy(() => import("./views/HomeView"));
// const EditorView = React.lazy(() => import("./views/EditorView"));
// const BrowseView = React.lazy(() => import("./views/BrowseView"));

const App: React.FC = () => {
  // Example data - in a real app, this would come from a store
  const dummyNotes = [
    {
      id: "1",
      title: "Introduction to React",
      content: "React is a JavaScript library for building user interfaces.",
      updatedAt: new Date(),
      tags: ["react", "javascript"]
    },
    {
      id: "2",
      title: "TypeScript Basics",
      content: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
      updatedAt: new Date(),
      tags: ["typescript", "programming"]
    }
  ];

  const availableTags = ["react", "javascript", "typescript", "programming"];

  return (
      <Layout>
        <Routes>
          <Route
              path="/"
              element={<BrowseView notes={dummyNotes} tags={availableTags} />}
          />
          <Route
              path="/notes"
              element={<BrowseView notes={dummyNotes} tags={availableTags} />}
          />
          <Route
              path="/notes/:id"
              element={<NoteView notes={dummyNotes} />} // New view-only route
          />
          <Route
              path="/notes/:id/edit"
              element={<EditorView onSave={note => console.log('Saving note:', note)} />}
          />
          <Route
              path="/new"
              element={<EditorView onSave={note => console.log('Creating note:', note)} />}
          />
        </Routes>
      </Layout>
  );
};

export default App;