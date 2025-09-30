import React, { useEffect, useState } from 'react';

interface Props {
  onUsePrompt: (prompt: string) => void;
}

const DailyPrompt: React.FC<Props> = ({ onUsePrompt }) => {
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/prompt');
        const data = await res.json();
        setPrompt(data.prompt);
      } catch (error) {
        console.error('Error fetching daily prompt:', error);
      }
    };

    fetchPrompt();
  }, []);

  return (
    <div className="bg-blue-100 text-blue-800 p-4 rounded shadow mb-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">🗓️ Daily Speaking Prompt</h3>
      <p className="mb-2">{prompt}</p>
      <button
        onClick={() => onUsePrompt(prompt)}
        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        🎙️ Practice this prompt
      </button>
    </div>
  );
};

export default DailyPrompt;
