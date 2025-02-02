export const startRecording = (
  setIsRecording: (isRecording: boolean) => void,
  setNotesInput: (notesInput: string) => void,
  recognitionRef: any
) => {
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    alert("Your browser does not support Speech Recognition");
    return;
  }

  const recognition = new (window as any).webkitSpeechRecognition();
  if (!recognition) {
    alert("Your browser does not support Speech Recognition");
    return;
  }

  recognition.continuous = true; // Keeps listening until stopped
  recognition.interimResults = true; // Show intermediate results
  recognition.lang = "en-US"; // Set language

  recognition.onstart = () => setIsRecording(true);
  recognition.onend = () => setIsRecording(false);
  recognition.onerror = (event: any) =>
    console.error("Speech recognition error:", event);

  recognition.onresult = (event: any) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    setNotesInput(transcript);
  };

  recognitionRef.current = recognition;
  recognition.start();
};

// Function to stop recording
export const stopRecording = (recognitionRef: any) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
