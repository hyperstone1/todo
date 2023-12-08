import { createAsyncThunk } from "@reduxjs/toolkit";
import { PromiseDB } from "../../utils/types";
import { openDB } from "idb";

export const fetchNotes = createAsyncThunk<PromiseDB, void>(
  "notes/fetchNotes",
  async () => {
    const db = await openDB("notesDB", 1);
    const transaction = db.transaction(["notesStore", "tagsStore"], "readonly");
    const store = transaction.objectStore("notesStore");
    const tagsStore = transaction.objectStore("tagsStore");
    const notes = await store.getAll();
    const tags = await tagsStore.getAll();
    return { notes, tags };
  }
);
// Другие асинхронные операции с заметками, такие как создание и удаление, могут быть добавлены здесь.
