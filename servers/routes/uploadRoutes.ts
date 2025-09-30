// routes/uploadRoutes.ts
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { OpenAI } from 'openai';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

router.post('/audio', upload.single('audio'), async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const transcriptResponse = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
    });

    const transcript = transcriptResponse.text;

    // Optional: clean up file
    fs.unlinkSync(filePath);

    res.json({ transcript });
  } catch (err) {
    console.error('Whisper error:', err);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

export default router;
