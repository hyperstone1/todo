import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "./store/store";
// import { fetchNotes, fetchTags } from './store/notes/notesSlice';
import NoteList from "./components/NoteList/NoteList";
import NoteTags from "./components/NoteTags/NoteTags";
import NoteForm from "./components/NoteForm/NoteForm";
import { addNote } from "./store/notes/notesSlice";
import { Note } from "./utils/types";
import { saveNoteToIndexedDB } from "./utils/indexedDB";
import { fetchNotes } from "./store/notes/notesThunks";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const [filteredData, setFilteredData] = useState<Note[]>([]);
  // Получение списка заметок из Redux
  const notes = useSelector((state: RootState) => state.notes.notes);
  const loading = useSelector((state: RootState) => state.notes.loading);
  const error = useSelector((state: RootState) => state.notes.error);
  // Получение списка тегов из Redux
  const tags = useSelector((state: RootState) => state.notes.tags);

  const onSubmit = (note: Note) => {
    dispatch(addNote(note));
    saveNoteToIndexedDB(note);
  };

  useEffect(() => {
    dispatch(fetchNotes() as any);
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="todo">
      <div className="container">
        <div className="container__list">
          <NoteForm
            notes={notes}
            onSubmit={onSubmit}
            filteredData={filteredData}
            setFilteredData={setFilteredData}
          />
          <NoteTags
            notes={notes}
            tags={tags}
            setFilteredData={setFilteredData}
          />
          <NoteList notes={notes} filteredData={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default App;
