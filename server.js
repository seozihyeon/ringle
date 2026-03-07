require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(bodyParser.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment for server.');
}

const ai = new GoogleGenAI({ apiKey });

app.post('/api/generate-curriculum', async (req, res) => {
  try {
    const profile = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `Create a personalized English learning curriculum based on this user profile: ${JSON.stringify(profile)}.\n\nReturn a JSON object matching the Curriculum interface.`,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    res.json(text ? JSON.parse(text) : null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/generate-feedback', async (req, res) => {
  try {
    const { transcript } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following English speaking transcript and provide feedback in JSON format. Transcript: "${transcript}"`,
      config: { responseMimeType: 'application/json' }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a quick English speaking quiz about "${topic}". Return JSON with prompt and hint.`,
      config: { responseMimeType: 'application/json' }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API proxy server listening on port ${port}`);
});
