import React, { useState } from "react";
import { Input } from "antd";
import { Note, Tag } from "../../utils/types";
import { v4 as uuidv4 } from "uuid";

interface NoteFormProps {
  notes: Note[];
  onSubmit: (note: Note) => void;
  filteredData: Note[];
  setFilteredData: React.Dispatch<React.SetStateAction<Note[]>>;
}

interface NewNote {
  text: string;
  tags: Tag[];
}

const NoteForm: React.FC<NoteFormProps> = ({
  notes,
  onSubmit,
  filteredData,
  setFilteredData,
}) => {
  const [noteText, setNoteText] = useState<NewNote>({ text: "", tags: [] });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      id: uuidv4(),
      text: noteText.text,
      tags: noteText.tags,
      createdAt: new Date().toLocaleDateString(),
    });

    setNoteText({ text: "", tags: [] });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const words = event.target.value.split(" ");
    const newTags = words
      .filter((word) => word.startsWith("#"))
      .map((word) => ({ id: word.substring(1) }));
    setNoteText({ ...noteText, text: event.target.value, tags: newTags });
  };

  const resetFilter = () => {
    setFilteredData([]);
  };
  //   const handleChange = (newContent: string) => {

  //     setEditableNote({ ...editableNote, content: newContent, tags: newTags });
  //  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Input
        placeholder="Введите вашу заметку"
        value={noteText.text}
        onChange={handleChange}
      />
      <div className="form__btns">
        <button className="button" type="submit">
          Добавить
        </button>
        {filteredData.length > 0 ? (
          <button onClick={() => resetFilter()} className="button button-del">
            Сбросить
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default NoteForm;
