import React, { useState, useRef, useEffect } from "react";
import TranscriptHighlighter from "./TranscriptHighlighter";
interface Props {
  selectedPrompt?: string;
}

const MicRecorder: React.FC<Props> = ({ selectedPrompt }) => {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
const [pronunciationFeedback, setPronunciationFeedback] = useState<string>("");


  useEffect(() => {
    let timer: any;
    if (isRecording && startTime !== null) {
      timer = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, startTime]);

  const startRecording = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + " ";
        } else {
          interimTranscript += transcriptPiece + " ";
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setStartTime(Date.now());
    setDuration(0);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!transcript) return;
    try {
      const res = await fetch("http://localhost:5000/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, prompt: selectedPrompt, duration }),
      });

      const data = await res.json();
      alert("Transcript saved! 🎉");
      console.log(data);
    } catch (err) {
      console.error("Error saving session:", err);
    }

    // Fetch pronunciation feedback
    try {
      const res = await fetch("http://localhost:5000/api/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const feedbackData = await res.json();
      setPronunciationFeedback(feedbackData.feedback);
      alert("Pronunciation feedback received! 🎉");
      console.log(feedbackData);
    } catch (err) {
      console.error("Error fetching pronunciation feedback:", err);
    }
  };

  const handleTextUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setTranscript(text);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload/audio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.transcript);
      setUploadedAudioUrl(data.audioUrl);
    } catch (err) {
      console.error("Audio upload failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        🎙️ Speak & Record
      </h2>

      {selectedPrompt && (
        <div className="mb-6 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-gray-700">
          <span className="font-semibold">📝 Prompt:</span> {selectedPrompt}
        </div>
      )}

      <div className="flex justify-center items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-2 rounded font-semibold shadow-md ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } text-white transition duration-200`}
        >
          {isRecording ? "⏹ Stop Recording" : "🎤 Start Speaking"}
        </button>
        {isRecording} {(
          <span className="text-sm text-gray-600">⏱ {duration}s</span>
        )}
      </div>

      {transcript && (
        <div className="mt-6 bg-gray-100 border rounded p-4 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">
            🗒️ Live Transcript:
          </h3>
          <TranscriptHighlighter transcript={transcript} />
        </div>
      )}

      {pronunciationFeedback && (
        <div className="mt-6 bg-blue-100 border border-blue-300 rounded p-4 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">
            🗣️ Pronunciation Feedback:
          </h3>
          <p className="text-gray-700">{pronunciationFeedback}</p>
        </div>
      )}

      {audioURL && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            🎧 Your Recording:
          </h3>
          <audio controls className="w-full">
            <source src={audioURL} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div className="my-6 border-t pt-4">
        <h3 className="font-semibold mb-2">📁 Upload File Instead:</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Upload Text File (.txt)
          </label>
          <input type="file" accept=".txt" onChange={handleTextUpload} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Audio File
          </label>
          <input type="file" accept="audio/*" onChange={handleAudioUpload} />
        </div>

        {uploadedAudioUrl && (
          <audio controls className="mt-4 w-full">
            <source src={uploadedAudioUrl} />
          </audio>
        )}
      </div>

      {transcript && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded shadow"
          >
            💾 Save Transcript
          </button>
        </div>
      )}
    </div>
  );
};

export default MicRecorder;
