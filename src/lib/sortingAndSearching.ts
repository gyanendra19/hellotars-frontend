import { NoteType } from "../components/Dashboard";

// sorting notes
export const sortNotes = (
  setIsSorted: (isSorted: boolean) => void,
  isSorted: boolean,
  notes: NoteType[],
  setNotes: (note: NoteType[]) => void
) => {
  setIsSorted(!isSorted);
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return isSorted
      ? Number(dateB) - Number(dateA)
      : Number(dateA) - Number(dateB);
  });

  setNotes(sortedNotes);
};

// searching notes
export const handleSearchNotes = (
  notes: NoteType[],
  setNotes: (note: NoteType[]) => void,
  searchPrompt: string
) => {
  if (searchPrompt !== "") {
    const matchingNotes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchPrompt) ||
        note.content.toLowerCase().includes(searchPrompt)
    );
    setNotes(matchingNotes);
  }
};
