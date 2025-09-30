import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Chip, IconButton, Box, Typography, Button } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DownloadIcon from "@mui/icons-material/Download"; // Import DownloadIcon
import TranscriptHighlighter from "./TranscriptHighlighter";
import { downloadSessionAsPDF } from "../utils/downloadSessionAsPDF";

interface Session {
  id: number;
  transcript: string;
  created_at: string;
  feedback?: string;
  fluency_score?: number;
  prompt?: string;
  cefr_level?: string;
  wpm?: number;
}

interface Props {
  sessions: Session[];
}

const SessionList: React.FC<Props> = ({ sessions }) => {
  const [filterPrompt, setFilterPrompt] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const uniquePrompts = Array.from(
    new Set(sessions.map((s) => s.prompt).filter(Boolean))
  );

  const filteredSessions = filterPrompt
    ? sessions.filter((s) => s.prompt === filterPrompt)
    : sessions;

  const session = filteredSessions[currentIndex];
  const total = filteredSessions.length;

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDownload = () => {
    downloadSessionAsPDF({
      transcript: session.transcript,
      feedback: session.feedback || "",
      cefr_level: session.cefr_level,
      fluency_score: session.fluency_score,
      sessionDate: new Date(session.created_at).toLocaleDateString(),
    });
  };

  return (
    <div className="mt-10 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">📝 Previous Sessions</h2>

      {uniquePrompts.length > 0 && (
        <div className="mb-6">
          <label htmlFor="prompt-filter" className="sr-only">
            Filter by Prompt
          </label>
          <select
            id="prompt-filter"
            value={filterPrompt}
            onChange={(e) => {
              setFilterPrompt(e.target.value);
              setCurrentIndex(0);
            }}
            className="border px-3 py-2 rounded text-sm w-full"
          >
            <option value="">All Prompts</option>
            {uniquePrompts.map((prompt, idx) => (
              <option key={idx} value={prompt}>
                {prompt!.slice(0, 40)}...
              </option>
            ))}
          </select>
        </div>
      )}

      <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
        Download PDF
      </Button>
      {total === 0 ? (
        <p className="text-gray-500">No sessions found for this prompt.</p>
      ) : (
        <div className="p-4 border rounded bg-gray-50 space-y-3">
          <TranscriptHighlighter transcript={session.transcript} />

          {session.prompt && (
            <p className="text-sm text-yellow-800">
              📝 Prompt: <span className="italic">{session.prompt}</span>
            </p>
          )}

          {/* Chips */}
          <div className="flex gap-2 flex-wrap">
            {session.fluency_score !== undefined && (
              <Chip
                label={`🌟 ${session.fluency_score}/10`}
                color="primary"
                size="small"
              />
            )}

            {session.cefr_level && (
              <Chip
                label={`🎯 ${session.cefr_level}`}
                color={
                  session.cefr_level?.startsWith("C")
                    ? "success"
                    : session.cefr_level?.startsWith("B")
                    ? "warning"
                    : "error"
                }
                size="small"
              />
            )}

            {session.wpm && (
              <Chip label={`🚀 ${session.wpm} WPM`} color="info" size="small" />
            )}
          </div>

          <span className="text-sm text-gray-500 block">
            {new Date(session.created_at).toLocaleString()}
          </span>

          {session.feedback && (
            <div className="text-sm bg-yellow-50 p-3 rounded border mt-2">
              <strong className="block mb-2">AI Feedback:</strong>
              <ReactMarkdown>
                {(() => {
                  try {
                    const parsed = JSON.parse(session.feedback);
                    return parsed.feedback || session.feedback;
                  } catch {
                    return session.feedback;
                  }
                })()}
              </ReactMarkdown>
            </div>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mt: 3,
            }}
          >
            <IconButton
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              size="medium"
              sx={{
                border: 1,
                borderColor: currentIndex === 0 ? "grey.300" : "grey.400",
                "&:hover": {
                  bgcolor: currentIndex === 0 ? "transparent" : "grey.100",
                },
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>

            <Typography
              variant="body2"
              sx={{ fontWeight: 500, minWidth: "120px", textAlign: "center" }}
            >
              Session {currentIndex + 1} of {filteredSessions.length}
            </Typography>

            <IconButton
              onClick={handleNext}
              disabled={currentIndex === filteredSessions.length - 1}
              size="medium"
              sx={{
                border: 1,
                borderColor:
                  currentIndex === filteredSessions.length - 1
                    ? "grey.300"
                    : "grey.400",
                "&:hover": {
                  bgcolor:
                    currentIndex === filteredSessions.length - 1
                      ? "transparent"
                      : "grey.100",
                },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        </div>
      )}
    </div>
  );
};

export default SessionList;
