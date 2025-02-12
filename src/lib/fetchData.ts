import axios from "axios";
import { NoteType, User } from "../components/Dashboard";

export const fetchUserFromDb = async (setUser: (user: User) => void) => {
  const email = localStorage.getItem("email");
  const user = await axios.get(`https://5pqs5m-5000.csb.app/api/users/${email}`);
  setUser(user.data[0]);
};

export const fetchNotesFromDb = async (
  setNotes: (note: NoteType[]) => void,
  user: User,
  setLoading: (loading: boolean) => void
) => {
  if (user) {
    setLoading(true)
    const notes = await axios.get(
      `https://5pqs5m-5000.csb.app/api/notes/${user?._id}`
    );
    setNotes(notes.data);
    setLoading(false)
  }
};
