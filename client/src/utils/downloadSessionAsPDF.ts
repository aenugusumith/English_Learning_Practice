import jsPDF from 'jspdf';

interface SessionPDFOptions {
  transcript: string;
  feedback: string;
  cefr_level?: string;
  fluency_score?: number;
  sessionDate?: string;
}

export const downloadSessionAsPDF = ({
  transcript,
  feedback,
  cefr_level,
  fluency_score,
  sessionDate
}: SessionPDFOptions) => {
  const doc = new jsPDF();

  const title = '📝 English Speaking Practice - Session Report';
  const dateLine = sessionDate ? `📅 Date: ${sessionDate}` : '';

  const content = `
${title}
${dateLine}

🗒️ Transcript:
${transcript}

💬 AI Feedback:
${feedback}

🎯 CEFR Level: ${cefr_level || 'N/A'}
🌟 Fluency Score: ${fluency_score ?? 'N/A'}/10
`;

  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 10, 10);
  doc.save('english_session.pdf');
};
