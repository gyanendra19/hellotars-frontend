import { useEffect, useRef, useState } from "react";
import {
  Search,
  Files,
  CircleDot,
  PenLine,
  House,
  Star,
  SendHorizontal,
  Trash2,
  ArrowUpDown,
  RemoveFormatting,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import NoteModal from "./NoteModal";
import { copyToClipBoard } from "../utils/copyText";
import { startRecording, stopRecording } from "../lib/speectToText";
import axios from "axios";
import { formatDate } from "../utils/formatDate";
import { fetchNotesFromDb, fetchUserFromDb } from "../lib/fetchData";
import { handleSearchNotes, sortNotes } from "../lib/sortingAndSearching";
import { toast } from "react-hot-toast";

export interface NoteType {
  _id: string;
  type: string;
  title: string;
  content: string;
  favourite: boolean;
  createdAt: number;
  duration?: string;
  images?: number;
  imageUrl?: string;
}

export interface User {
  _id: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [notesInput, setNotesInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [noteToOpen, setNoteToOpen] = useState<NoteType | null | undefined>(
    null
  );
  const [isSorted, setIsSorted] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState("");
  const recognitionRef = useRef<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [editTitle, setEditTitle] = useState(false);
  const [sidebarButton, setSidebarButton] = useState("Home");
  const [loading, setLoading] = useState(false);

  // fetching user data from db
  useEffect(() => {
    fetchUserFromDb(setUser);
  }, []);

  //fetching notes data from db
  useEffect(() => {
    if (user) {
      fetchNotesFromDb(setNotes, user, setLoading);
    }
  }, [user]);

  // set favourite notes
  useEffect(() => {
    if (sidebarButton === "Favourites") {
      setNotes((prevNotes) => prevNotes.filter((note) => note.favourite));
    } else {
      fetchUserFromDb(setUser);
    }
  }, [sidebarButton]);

  // saving notes data to mongodb
  const saveNotesToDb = async (isAudio: boolean) => {
    try {
      const email = localStorage.getItem("email");
      await axios.post(`https://5pqs5m-5000.csb.app/api/notes`, {
        title: "New Note",
        content: notesInput,
        type: isAudio ? "audio" : "text",
        favourite: false,
        email,
        duration: 200,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // editing and updating the notes
  const editNote = async (
    noteId: string,
    field: string,
    value: string | boolean
  ) => {
    try {
      setNoteToOpen((prev) => ({ ...prev!, [field]: value }));
      setLoading(true);
      await axios.put(`https://5pqs5m-5000.csb.app/api/notes`, {
        noteId,
        field,
        value,
      });
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          noteId === note._id ? { ...note, [field]: value } : note
        )
      );
      setLoading(false);
      setEditTitle(false);
      toast.success("Updated successfully");
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  // adding notes
  const handleAddNotes = (e: any) => {
    e.preventDefault();
    setNotes([
      ...notes,
      {
        _id: uuidv4(),
        type: isRecording ? "audio" : "text",
        title: "New Note",
        content: notesInput,
        favourite: false,
        createdAt: Date.now(),
        duration: "00:10",
        images: 0,
      },
    ]);

    toast.success("Note Added");
    if (isRecording) {
      saveNotesToDb(true);
      stopRecording(recognitionRef);
    } else {
      saveNotesToDb(false);
    }

    setNotesInput("");
  };

  // deleting notes
  const deleteNotes = async (noteId: string) => {
    try {
      setNotes(notes.filter((note) => note._id !== noteId));
      setLoading(true);
      await axios.delete(`https://5pqs5m-5000.csb.app/api/notes/${noteId}`);
      setLoading(false);
      toast.success("Deleted note");
    } catch (err) {
      toast.error("Error deleting note");
      console.log(err);
    }
  };

  // finding note to open in the modal
  const handleNoteToOpen = (id: string) => {
    const selectedNote = notes.find((note) => note._id === id);
    setNoteToOpen(selectedNote);
  };

  return (
    <div className="flex h-screen bg-white overflow-y-hidden">
      {loading && (
        <div className="fixed inset-0 z-[1100] flex justify-center items-center text-2xl w-full h-full bg-black/20">
          Loading....
        </div>
      )}
      <NoteModal
        note={noteToOpen!}
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        handleEdit={editNote}
      />
      {/* Sidebar */}
      <aside className="w-[20%] p-4">
        <div className="border border-gray-300 flex flex-col w-full h-full p-6 rounded-3xl">
          <h1 className="text-xl font-semibold pb-2 mb-4 border-b border-gray-200">
            AI Notes
          </h1>
          <nav className="space-y-4">
            <button
              onClick={() => setSidebarButton("Home")}
              className={`flex items-center space-x-2 m-0 p-2 rounded-lg w-full ${
                sidebarButton === "Home" ? "bg-purple-100" : "text-gray-500"
              }`}
            >
              <House size={18} />
              <span className="font-medium">Home</span>
            </button>
            <button
              onClick={() => setSidebarButton("Favourites")}
              className={`flex rounded-lg items-center space-x-2 p-2 w-full ${
                sidebarButton === "Favourites"
                  ? "bg-purple-100"
                  : "text-gray-500"
              }`}
            >
              <Star size={18} />
              <span>Favourites</span>
            </button>
          </nav>
          <div className="mt-auto flex items-center space-x-2 text-gray-600">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <span>Emmanual Vincent</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5">
        {/* Header */}
        <div className="flex justify-between gap-4 items-center mb-6">
          <div className="relative w-full">
            <input
              type="text"
              value={searchPrompt}
              onChange={(e) => {
                setSearchPrompt(e.target.value);
                handleSearchNotes(notes, setNotes, searchPrompt);
              }}
              placeholder="Search"
              className="w-full p-2 rounded-full pl-10 border focus:outline-none border-gray-300"
            />
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          </div>
          <button
            onClick={() => sortNotes(setIsSorted, isSorted, notes, setNotes)}
            className="flex items-center cursor-pointer space-x-2 border px-4 py-2 border-gray-200 rounded-full bg-gray-200"
          >
            <ArrowUpDown size={16} />
            <span className="font-medium">Sort</span>
          </button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-3 h-[75%] scroll-hide gap-6 overflow-y-scroll">
          {notes?.map((note) => (
            <>
              <div
                key={note._id}
                onClick={() => {
                  handleNoteToOpen(note._id);
                  setIsModalOpen(true);
                }}
                className="border relative border-gray-200 h-[300px] p-4 rounded-xl"
              >
                <div className="w-full flex justify-between items-center">
                  <p className="text-gray-500 text-sm">
                    {formatDate(note.createdAt)}
                  </p>
                  {note.type === "audio" ? (
                    <div className="w-fit">
                      <button className="p-1.5 text-xs bg-gray-200 rounded-full">
                        ▶️
                      </button>
                    </div>
                  ) : (
                    <div className="w-fit">
                      <button className="p-1.5 text-xs bg-gray-200 rounded-full">
                        <RemoveFormatting size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <h2 className="font-semibold mt-2">{note.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{note.content}</p>
                {note?.images! > 0 && <span>📷 {note.images} Image</span>}
                <div className="absolute z-40 bottom-4 right-4 gap-2 flex">
                  <button
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipBoard(note.content);
                    }}
                  >
                    <Files size={16} color="gray" />
                  </button>
                  <button
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotes(note._id);
                    }}
                  >
                    <Trash2 size={16} color="gray" />
                  </button>
                </div>
              </div>
            </>
          ))}
        </div>
      </main>

      {/* Floating Button */}
      <div className="fixed bottom-6 left-[30%] shadow-xl bg-white focus:outline-none w-[60%] rounded-full">
        <div className="relative w-full">
          <form onSubmit={handleAddNotes} action="">
            <button className="absolute left-5 top-5 text-gray-500">
              <PenLine size={18} />
            </button>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full p-2 border-none rounded-full pl-14 py-4 border focus:outline-none"
            />
            {notesInput === "" ? (
              <button
                onClick={() =>
                  startRecording(setIsRecording, setNotesInput, recognitionRef)
                }
                type="button"
                className="absolute right-2 cursor-pointer top-2 bg-red-500 text-white px-3 py-2 rounded-full flex items-center space-x-2"
              >
                <CircleDot color="white" size={20} />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                type="submit"
                className="absolute cursor-pointer right-2 top-2 bg-red-500 text-white px-3 py-2 rounded-full flex items-center space-x-2"
              >
                <SendHorizontal color="white" size={20} />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
