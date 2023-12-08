export interface Note {
  id: string;
  text: string;
  tags: Tag[];
  createdAt: string;
}
export interface Tag {
  id: string;
}
export interface PromiseDB {
  notes: Note[];
  tags: Tag[];
}
