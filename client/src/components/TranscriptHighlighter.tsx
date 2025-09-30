import React, { useState } from 'react';

interface Props {
  transcript: string;
  sentenceFeedbackMap?: Record<string, string>; // Optional: sentence → GPT feedback
}

const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually'];
const advancedWords = ['moreover', 'consequently', 'notwithstanding', 'albeit', 'intricate', 'ubiquitous','essentially','nevertheless'];
const grammarErrors = ['is', 'are', 'was', 'were', 'has', 'have', 'do', 'does', 'did']; // Simplified example

const TranscriptHighlighter: React.FC<Props> = ({ transcript, sentenceFeedbackMap = {} }) => {
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);

  const highlightWord = (word: string) => {
    const clean = word.toLowerCase().replace(/[.,!?]/g, '');

    if (fillerWords.includes(clean)) {
      return <span className="text-yellow-500 font-semibold">{word}</span>;
    }

    if (advancedWords.includes(clean)) {
      return <span className="text-green-600 font-semibold">{word}</span>;
    }

    if (grammarErrors.includes(clean)) {
      return <span className="text-red-500 font-semibold underline">{word}</span>;
    }

    return word;
  };

  const splitIntoSentences = (text: string) =>
    text.match(/[^.!?]+[.!?]?/g)?.map((s) => s.trim()) || [];

  const handleSentenceClick = (sentence: string) => {
    setSelectedSentence(sentence === selectedSentence ? null : sentence);
  };

  return (
    <div className="space-y-2">
      {splitIntoSentences(transcript).map((sentence, i) => (
        <div key={i} className="relative group">
          <p
            onClick={() => handleSentenceClick(sentence)}
            className="cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 transition inline-block"
          >
            {sentence.split(/(\s+)/).map((part, idx) =>
              part.trim() === '' ? part : (
                <React.Fragment key={idx}>
                  {highlightWord(part)}
                </React.Fragment>
              )
            )}
          </p>

          {/* Tooltip or feedback display */}
          {selectedSentence === sentence && sentenceFeedbackMap[sentence] && (
            <div className="mt-1 bg-white border border-gray-200 p-2 rounded shadow text-sm text-gray-700 max-w-md">
              <strong>Feedback:</strong> {sentenceFeedbackMap[sentence]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TranscriptHighlighter;
