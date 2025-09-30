import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Props {
  sessions: {
    fluency_score?: number;
    created_at: string;
  }[];
}

const FluencyChart: React.FC<Props> = ({ sessions }) => {
  const chartData = sessions
    .filter((s) => s.fluency_score !== undefined)
    .map((s) => ({
      date: new Date(s.created_at).toLocaleDateString(),
      score: s.fluency_score!,
    }));

  const average =
    chartData.reduce((sum, s) => sum + s.score, 0) / chartData.length || 0;

  return (
    <div className="bg-white p-6 rounded shadow mt-10 max-w-2xl mx-auto">
      <h3 className="text-lg font-bold mb-4">📈 Fluency Progress</h3>

      {chartData.length === 0 ? (
        <p className="text-gray-500">No sessions to show yet.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-4 text-sm text-gray-700">
            🔹 Average Score:{" "}
            <span className="font-semibold">{average.toFixed(2)}/10</span>
          </p>
          <p className="text-sm text-gray-700">
            🔁 Total Practice Sessions:{" "}
            <span className="font-semibold">{chartData.length}</span>
          </p>
        </>
      )}
    </div>
  );
};

export default FluencyChart;
