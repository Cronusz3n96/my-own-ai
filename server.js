import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const KEY = process.env.CEREBRAS_API_KEY;
const MODEL = process.env.MODEL || 'qwen-3.8-27b';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: MODEL, keySet: !!KEY });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system, temperature = 0.7, maxTokens = 2048 } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }
    if (!KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const fullMessages = [];
    if (system) {
      fullMessages.push({ role: 'system', content: system });
    }
    fullMessages.push(...messages);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens: maxTokens,
        messages: fullMessages,
        stream: false,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data?.error?.message || JSON.stringify(data?.error) || `API error ${response.status}`;
      return res.status(response.status).json({ error: errorMsg });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return res.status(502).json({ error: 'Empty response from API' });
    }

    res.json({
      reply: content,
      model: MODEL,
      usage: data.usage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT} | model=${MODEL}`);
});
