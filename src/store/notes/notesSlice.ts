import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Note, Tag } from "../../utils/types";
import { fetchNotes } from "./notesThunks";

interface NotesState {
  notes: Note[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  tags: [],
  loading: false,
  error: null,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    // fetchNotesStart(state) {
    //   state.loading = true;
    //   state.error = null;
    // },
    // fetchNotesSuccess(state, action: PayloadAction<Note[]>) {
    //   state.loading = false;
    //   state.notes = action.payload;
    // },
    // fetchNotesFailure(state, action: PayloadAction<string>) {
    //   state.loading = false;
    //   state.error = action.payload;
    // },
    addNote(state, action: PayloadAction<Note>) {
      state.notes.push(action.payload);
      if (action.payload.tags.length > 0) {
        action.payload.tags.forEach((tag) => {
          let foundTag = state.tags.find((item) => item.id === tag.id);
          if (!foundTag) {
            state.tags.push(tag);
          }
        });
      }
    },
    deleteNote(state, action: PayloadAction<string>) {
      const noteIndex = state.notes.findIndex(
        (note) => note.id === action.payload
      );
      if (noteIndex !== -1) {
        state.notes.splice(noteIndex, 1);
      }
      const tagsWithIds = state.tags.map((tag) => {
        const tagWithIds: { tag: string; id: string[] } = {
          tag: tag.id,
          id: [],
        };

        state.notes.forEach((note) => {
          if (note.tags && note.tags.some((noteTag) => noteTag.id === tag.id)) {
            tagWithIds.id.push(note.id);
          }
        });

        return tagWithIds;
      });
      tagsWithIds.map((tags) => {
        if (tags.id.length < 1) {
          state.tags = state.tags.filter((tag) => tag.id !== tags.tag);
        }
        return tags;
      });
    },
    editNote(state, action: PayloadAction<Note>) {
      const updatedNote = action.payload;
      const index = state.notes.findIndex((note) => note.id === updatedNote.id);

      if (index !== -1) {
        state.notes[index] = updatedNote;
      }
      const noteTags = updatedNote.tags.map((item) => item.id);
      const stateTags = state.tags.map((item) => item.id);
      const newTags = noteTags.filter((tag) => {
        return !stateTags.includes(tag);
      });
      if (newTags.length > 0) {
        newTags.map((item) => {
          state.tags.push({ id: item });
          return item;
        });
      }
      //TEST
      const tagsWithIds = state.tags.map((tag) => {
        const tagWithIds: { tag: string; id: string[] } = {
          tag: tag.id,
          id: [],
        };

        state.notes.forEach((note) => {
          if (note.tags && note.tags.some((noteTag) => noteTag.id === tag.id)) {
            tagWithIds.id.push(note.id);
          }
        });

        return tagWithIds;
      });
      tagsWithIds.map((tags) => {
        if (tags.id.length < 1) {
          state.tags = state.tags.filter((tag) => tag.id !== tags.tag);
        }
        return tags;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload.notes;
        state.tags = action.payload.tags;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notes.";
      });
  },
});

export const {
  //   fetchNotesStart,
  //   fetchNotesSuccess,
  //   fetchNotesFailure,
  addNote,
  deleteNote,
  editNote,
} = notesSlice.actions;

export default notesSlice.reducer;
