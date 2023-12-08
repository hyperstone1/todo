import { createAsyncThunk } from "@reduxjs/toolkit";
import { PromiseDB } from "../../utils/types";
// import { openDB } from "idb";
// import { DB_NAME, TAGS_STORE_NAME, STORE_NAME } from "../../utils/constants";
import { fetchNotesFromIndexedDB } from "../../utils/indexedDB";

export const fetchNotes = createAsyncThunk<PromiseDB, void>(
  "notes/fetchNotes",
  async () => {
    try {
      const { notes, tags } = await fetchNotesFromIndexedDB();
      return { notes, tags };
    } catch (error) {
      throw new Error("Failed to fetch notes.");
    }
  }
);
