import { Note, Tag, PromiseDB } from "./types";
import { DB_NAME, STORE_NAME, TAGS_STORE_NAME } from "./constants";

export async function fetchNotesFromIndexedDB(): Promise<PromiseDB> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(DB_NAME);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onupgradeneeded = (event) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
      db.createObjectStore(TAGS_STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
    };

    request.onsuccess = (event) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
      const transaction: IDBTransaction = db.transaction(
        [STORE_NAME, TAGS_STORE_NAME],
        "readonly"
      );
      const tagsStore: IDBObjectStore =
        transaction.objectStore(TAGS_STORE_NAME);
      const store: IDBObjectStore = transaction.objectStore(STORE_NAME);
      const notes: Note[] = [];
      const tags: Tag[] = [];

      const cursorRequest: IDBRequest<IDBCursorWithValue | null> =
        store.openCursor();
      const cursorPromise = new Promise((cursorRes) => {
        cursorRequest.onsuccess = (event) => {
          const cursor: IDBCursorWithValue | null = (
            event.target as IDBRequest<IDBCursorWithValue | null>
          ).result;

          if (cursor) {
            notes.push(cursor.value);
            cursor.continue();
          } else {
            cursorRes(notes);
          }
        };
      });

      const tagCursorRequest: IDBRequest<IDBCursorWithValue | null> =
        tagsStore.openCursor();
      const tagCursorPromise = new Promise((tagCursorResolve) => {
        tagCursorRequest.onsuccess = (event) => {
          const cursor: IDBCursorWithValue | null = (
            event.target as IDBRequest<IDBCursorWithValue | null>
          ).result;

          if (cursor) {
            tags.push(cursor.value);
            cursor.continue();
          } else {
            tagCursorResolve(tags);
          }
        };
      });

      Promise.all([cursorPromise, tagCursorPromise])
        .then(() => {
          const promiseDB: PromiseDB = {
            notes,
            tags,
          };
          resolve(promiseDB);
        })
        .catch((error) => {
          reject(new Error("Failed to fetch notes from IndexedDB"));
        });
    };
  });
}

export async function saveNoteToIndexedDB(note: Note): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(
        [STORE_NAME, TAGS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(STORE_NAME);
      const tagsStore = transaction.objectStore(TAGS_STORE_NAME);

      store.add(note).onsuccess = () => {
        resolve();
      };

      note.tags.forEach((tag) => {
        const reqTags = tagsStore.add(tag);
        reqTags.onerror = function (event) {
          if (reqTags.error?.name === "ConstraintError") {
            console.log("Заметка с таким id уже существует");
            event.preventDefault();
          }
        };
      });
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      db.createObjectStore(TAGS_STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
    };
  });
}

export async function deleteNoteFromIndexedDB(noteId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(
        [STORE_NAME, TAGS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(STORE_NAME);
      const tagsStore = transaction.objectStore(TAGS_STORE_NAME);

      store.delete(noteId).onsuccess = () => {
        resolve();
      };
      const getAllNotesRequest = store.getAll();
      const getAllTagsRequest = tagsStore.getAll();
      let allNotes: Note[] = [];
      getAllNotesRequest.onsuccess = () => {
        allNotes = getAllNotesRequest.result;
      };

      //Проверка тегов
      getAllTagsRequest.onsuccess = () => {
        const tagsWithIds = getAllTagsRequest.result.map((tag) => {
          const tagWithIds: { tag: string; id: string[] } = {
            tag: tag.id,
            id: [],
          };

          allNotes.forEach((note) => {
            if (
              note.tags &&
              note.tags.some((noteTag) => noteTag.id === tag.id)
            ) {
              tagWithIds.id.push(note.id);
            }
          });

          return tagWithIds;
        });
        tagsWithIds.map((tags) => {
          if (tags.id.length < 1) {
            tagsStore.delete(tags.tag);
          }
          return tags;
        });
      };
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    };
  });
}
export async function editNoteInIndexedDB(note: Note): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = async () => {
      const db = request.result;
      const transaction = db.transaction(
        [STORE_NAME, TAGS_STORE_NAME],
        "readwrite"
      );
      const store = transaction.objectStore(STORE_NAME);
      const tagsStore = transaction.objectStore(TAGS_STORE_NAME);

      const getRequest = store.get(note.id);
      await new Promise<void>((resolve, reject) => {
        getRequest.onsuccess = () => {
          const existingNote = getRequest.result;
          if (existingNote) {
            const updatedNote = { ...existingNote, ...note };
            const updateRequest = store.put(updatedNote);
            updateRequest.onsuccess = () => {
              resolve();
            };
            updateRequest.onerror = () => {
              reject(new Error("Failed to update note in IndexedDB"));
            };
          } else {
            reject(new Error("Note not found in IndexedDB"));
          }
        };
      });

      const getAllNotesRequest = store.getAll();
      const getAllTagsRequest = tagsStore.getAll();
      let allNotes: Note[] = [];
      getAllNotesRequest.onsuccess = () => {
        allNotes = getAllNotesRequest.result;
      };
      getAllTagsRequest.onsuccess = () => {
        const existingTags = getAllTagsRequest.result.map((tag) => tag.id);
        const newTags = note.tags.filter((tag) => {
          return !existingTags.includes(tag.id);
        });

        (async function () {
          for (const tag of newTags) {
            try {
              await new Promise((resolve, reject) => {
                const reqTags = tagsStore.add(tag);
                reqTags.onsuccess = resolve;
                reqTags.onerror = reject;
              });
            } catch (error) {
              console.log("Ошибка при добавлении тега в tagsStore:", error);
            }
          }
        })();

        //Проверка тегов
        const tagsWithIds = getAllTagsRequest.result.map((tag) => {
          const tagWithIds: { tag: string; id: string[] } = {
            tag: tag.id,
            id: [],
          };

          allNotes.forEach((note) => {
            if (
              note.tags &&
              note.tags.some((noteTag) => noteTag.id === tag.id)
            ) {
              tagWithIds.id.push(note.id);
            }
          });

          return tagWithIds;
        });
        tagsWithIds.map((tags) => {
          if (tags.id.length < 1) {
            tagsStore.delete(tags.tag);
          }
          return tags;
        });
      };

      getRequest.onerror = () => {
        reject(new Error("Failed to get note from IndexedDB"));
      };
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    };
  });
}
