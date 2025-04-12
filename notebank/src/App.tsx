import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import BrowseView from "./views/BrowseView";
import EditorView from "./views/EditorView";
import NoteView from "./views/NoteView";
import { useNotesStore } from "./stores/notes";

// Lazy load views for better performance
// const HomeView = React.lazy(() => import("./views/HomeView"));
// const EditorView = React.lazy(() => import("./views/EditorView"));
// const BrowseView = React.lazy(() => import("./views/BrowseView"));

const App: React.FC = () => {
  // Get notes and tags from the store
  const { data: { notes, tags } } = useNotesStore();

  return (
      <Layout>
        <Routes>
          <Route
              path="/"
              element={<BrowseView notes={notes} tags={tags} />}
          />
          <Route
              path="/notes"
              element={<BrowseView notes={notes} tags={tags} />}
          />
          <Route
              path="/notes/:id"
              element={<NoteView notes={notes} />}
          />
          <Route
              path="/notes/:id/edit"
              element={<EditorView />}
          />
          <Route
              path="/new"
              element={<EditorView />}
          />
        </Routes>
      </Layout>
  );
};

export default App;