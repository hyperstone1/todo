import React from "react";
import { Note } from "../../utils/types";
import { List, Typography } from "antd";
import { deleteNote, editNote } from "../../store/notes/notesSlice";
import { useDispatch } from "react-redux";
import {
  deleteNoteFromIndexedDB,
  editNoteInIndexedDB,
} from "../../utils/indexedDB";

interface NoteListProps {
  notes: Note[];
  filteredData: Note[];
}

const { Paragraph } = Typography;

const NoteList: React.FC<NoteListProps> = ({ notes, filteredData }) => {
  const dispatch = useDispatch();

  const listItemStyles = {
    display: "flex",
    justifyContent: "space-beetwen",
    height: "100%",
  };

  const paragraphStyles = {
    width: "100%",
    height: "100%",
    marginBottom: "0",
  };

  const onEditNote = (item: Note, value: string) => {
    const words = value.split(" ");
    const newTags = words
      .filter((word) => word.startsWith("#"))
      .map((word) => ({ id: word.substring(1) }));
    const updatedNote = { ...item, tags: newTags, text: value };
    dispatch(editNote(updatedNote));
    editNoteInIndexedDB(updatedNote);
  };

  const delNote = (item: Note) => {
    dispatch(deleteNote(item.id));
    deleteNoteFromIndexedDB(item.id);
  };

  return (
    <List
      size="large"
      header={<div>Список задач</div>}
      bordered
      dataSource={filteredData.length > 0 ? filteredData : notes}
      renderItem={(item) => (
        <List.Item style={listItemStyles}>
          <Paragraph
            style={paragraphStyles}
            editable={{
              text: item.text,
              onChange: (value: string) => onEditNote(item, value),
            }}
          >
            {item.text.replace(/#/g, "")}
          </Paragraph>

          <div className="buttons">
            <button className="buttons__del" onClick={() => delNote(item)}>
              <svg
                height="512px"
                version="1.1"
                viewBox="0 0 512 512"
                width="512px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line className="st1" x1="112.5" x2="401" y1="112.5" y2="401" />
                <line className="st1" x1="401" x2="112.5" y1="112.5" y2="401" />
                <path d="M268.064,256.75l138.593-138.593c3.124-3.124,3.124-8.189,0-11.313c-3.125-3.124-8.189-3.124-11.314,0L256.75,245.436   L118.157,106.843c-3.124-3.124-8.189-3.124-11.313,0c-3.125,3.124-3.125,8.189,0,11.313L245.436,256.75L106.843,395.343   c-3.125,3.125-3.125,8.189,0,11.314c1.562,1.562,3.609,2.343,5.657,2.343s4.095-0.781,5.657-2.343L256.75,268.064l138.593,138.593   c1.563,1.562,3.609,2.343,5.657,2.343s4.095-0.781,5.657-2.343c3.124-3.125,3.124-8.189,0-11.314L268.064,256.75z" />
              </svg>
            </button>
          </div>
        </List.Item>
      )}
    />
  );
};

export default NoteList;
