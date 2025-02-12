import {
  X,
  Share,
  Download,
  Copy,
  Play,
  Pause,
  Star,
  PenLine,
  Check,
} from "lucide-react";
import { NoteType } from "./Dashboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDate } from "../utils/formatDate";

interface NoteModalProps {
  note: NoteType;
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  editTitle: boolean;
  setEditTitle: (editTitle: boolean) => void;
  handleEdit: (noteId: string, field: string, value: string | boolean) => void;
}

const NoteModal = ({
  note,
  isOpen,
  onClose,
  editTitle,
  setEditTitle,
  handleEdit,
}: NoteModalProps) => {
  if (!isOpen) return null;
  const [speechDuration, setSpeechDuration] = useState<number>(10000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const [editContent, setEditContent] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [titleContent, setTitleContent] = useState<string | null>(null);

  // animation of the audio play
  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - (previousTimeRef.current || 0);
      }

      const elapsed = timestamp - startTimeRef.current;
      setCurrentTime(elapsed);

      const newProgress = Math.min((elapsed / speechDuration) * 100, 100);
      setProgress(newProgress);

      if (elapsed < speechDuration) {
        animationRef.current = window.requestAnimationFrame(() =>
          animate(speechDuration)
        );
      } else {
        setIsPlaying(false);
        startTimeRef.current = 0;
        previousTimeRef.current = 0;
        setCurrentTime(speechDuration);
      }
    },
    [speechDuration]
  );

  // toggling of the audio
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
      window.speechSynthesis.cancel();
      previousTimeRef.current = currentTime;
    } else {
      if (progress >= 5) {
        setProgress(0);
        setCurrentTime(0);
        startTimeRef.current = 0;
        previousTimeRef.current = 0;
        window.speechSynthesis.resume();
      }
      setIsPlaying(true);
      animationRef.current = window.requestAnimationFrame(() =>
        animate(speechDuration)
      );
    }
  }, [isPlaying, progress, currentTime, animate]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // format seconds and milliseconds
  const formatTime = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const decimals = Math.floor((ms % 1000) / 10);
    return `${seconds.toString().padStart(2, "0")}.${decimals
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // finding the estimated time of the audio
  const estimateDuration = (text: string, rate: number) => {
    const words = text.split(" ").length; // Count the number of words in the text
    const estimatedDuration = (words / rate) * 1000; // Estimate duration in seconds
    return estimatedDuration;
  };

  // handling text to speech logic
  const handleTextToSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);

    const rate = utterance.rate; // Get the rate (default is 1.0)

    // Estimate duration
    const estimatedDuration = estimateDuration(text, rate);
    setSpeechDuration(estimatedDuration); // Set the estimated duration
  };

  // handling image
  const handleFileChange = (event: any, noteId: string) => {
    const file = event.target.files[0]; // Get the first selected file
    setSelectedFile(URL.createObjectURL(file));
    handleEdit(noteId, "imageUrl", URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000] bg-opacity-50">
      <div className="bg-white h-[85%] rounded-2xl shadow-lg w-[700px] p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            {editTitle ? (
              <input
                type="text"
                className="focus:outline-none w-[300px] text-lg font-semibold"
                value={titleContent !== null ? titleContent : note.title}
                onChange={(e) => setTitleContent(e.target.value)}
              />
            ) : (
              <h2 className="text-lg font-semibold">{note.title}</h2>
            )}
            {editTitle ? (
              <Check
                className="cursor-pointer"
                onClick={() => handleEdit(note._id, "title", titleContent!)}
                size={20}
              />
            ) : (
              <PenLine
                className="cursor-pointer"
                onClick={() => setEditTitle(true)}
                size={20}
              />
            )}
          </div>
          <div className="flex items-center">
            {editContent && (
              <button
                onClick={() => setEditContent(false)}
                className="px-5 cursor-pointer font-medium py-2 rounded-full bg-blue-300 mr-1"
              >
                Save
              </button>
            )}
            <button
              onClick={() =>
                note.favourite
                  ? handleEdit(note._id, "favourite", false)
                  : handleEdit(note._id, "favourite", true)
              }
              className={`p-1.5 rounded-full cursor-pointer ${
                note.favourite ? "bg-red-400" : "hover:bg-gray-100"
              }`}
            >
              <Star size={20} />
            </button>
            <button
              onClick={() => onClose(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <p className="text-gray-500 text-sm">{formatDate(note.createdAt)}</p>

        {/* Audio Player */}
        {editContent ? (
          <>
            <div className="mt-4">
              <textarea
                className="focus:outline-none w-full"
                rows={15}
                value={note.content}
                onChange={(e) =>
                  handleEdit(note._id, "content", e.target.value)
                }
              />
            </div>
          </>
        ) : (
          <>
            <div className="mt-4">
              <div className="flex items-center gap-1">
                {isPlaying ? (
                  <button
                    onClick={() => {
                      togglePlay();
                    }}
                    className="p-2 cursor-pointer rounded-full"
                  >
                    <Pause size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      togglePlay();
                      handleTextToSpeech(note.content);
                    }}
                    className="p-2 cursor-pointer rounded-full"
                  >
                    <Play size={20} />
                  </button>
                )}
                <div className="w-full bg-gray-300 h-1 rounded-lg">
                  <div
                    className={`w-[${Math.floor(progress)}%]${
                      !isPlaying
                        ? "transition-none"
                        : "transition-all duration-100 ease-linear"
                    } bg-red-500 h-1 rounded-lg`}
                  ></div>
                </div>
                <span className="text-sm font-medium">{`${formatTime(
                  currentTime
                )}`}</span>
              </div>
              <button className="mt-2 flex items-center gap-1 text-sm text-gray-700 hover:text-black">
                <Download size={16} />
                Download Audio
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 text-sm bg-gray-200 rounded-lg">
                Notes
              </button>
              <button className="px-4 py-2 text-sm bg-black text-white rounded-lg">
                Transcript
              </button>
              <button className="px-4 py-2 text-sm bg-gray-200 rounded-lg">
                Create
              </button>
              <button className="px-4 py-2 text-sm bg-gray-200 rounded-lg">
                Speaker Transcript
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Transcript</h3>
                <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-black">
                  <Copy size={16} />
                  Copy
                </button>
              </div>
              <p className="text-gray-700 text-sm mt-2">{note.content}</p>
              <button
                onClick={() => setEditContent(true)}
                className="text-sm text-blue-500 mt-2"
              >
                Read More
              </button>
            </div>

            {/* Image Section */}
            <div className="flex gap-4 mt-4">
              <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-lg">
                <img
                  src={selectedFile || note.imageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <button className="w-24 h-24 bg-gray-100 flex flex-col items-center justify-center rounded-lg">
                <label htmlFor="upload-image" className="text-md text-gray-600">
                  +Image
                </label>
                <input
                  onChange={(e) => handleFileChange(e, note._id)}
                  className="hidden"
                  type="file"
                  id="upload-image"
                />
              </button>
            </div>

            {/* Share Button */}
            <div className="flex justify-end mt-4">
              <button className="flex items-center px-4 py-2 bg-gray-200 rounded-lg">
                <Share size={16} />
                <span className="ml-2">Share</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NoteModal;
