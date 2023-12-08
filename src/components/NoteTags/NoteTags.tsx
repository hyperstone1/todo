import React from "react";
import { Space, Tag } from "antd";
import { Note, Tag as TagInt } from "../../utils/types";

interface NoteTagsProps {
  notes: Note[];
  tags: TagInt[];
  setFilteredData: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NoteTags: React.FC<NoteTagsProps> = ({
  notes,
  tags,
  setFilteredData,
}) => {
  const clickTag = (selectedTag: string) => {
    const filteredNotes = selectedTag
      ? notes.filter((note) =>
          note.tags.some((item) => item.id === selectedTag)
        )
      : notes;
    setFilteredData(filteredNotes);
  };

  return (
    <Space size={[0, 8]} wrap>
      {tags.map((item, i) => (
        <Tag onClick={() => clickTag(item.id)} key={i}>
          {item.id}
        </Tag>
      ))}
    </Space>
  );
};

export default NoteTags;
