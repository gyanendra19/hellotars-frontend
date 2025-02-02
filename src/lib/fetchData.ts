import axios from "axios";
import { NoteType, User } from "../components/Dashboard";

export const fetchUserFromDb = async (setUser: (user: User) => void) => {
  const email = localStorage.getItem("email");
  const user = await axios.get(`http://localhost:5000/api/users/${email}`);
  setUser(user.data[0]);
};

export const fetchNotesFromDb = async (
  setNotes: (note: NoteType[]) => void,
  user: User
) => {
  if (user) {
    const notes = await axios.get(
      `http://localhost:5000/api/notes/${user?._id}`
    );
    setNotes(notes.data);
  }
};
