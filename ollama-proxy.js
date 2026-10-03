import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const MODEL = process.env.MODEL || 'llama3.2:1b';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: MODEL, ollama: OLLAMA_HOST });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system, temperature = 0.7 } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const chatMessages = [];
    if (system) {
      chatMessages.push({ role: 'system', content: system });
    }
    chatMessages.push(...messages);

    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: chatMessages,
        stream: false,
        options: {
          temperature,
          num_predict: 2048,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data?.error || `Ollama error ${response.status}`;
      return res.status(response.status).json({ error: errorMsg });
    }

    const content = data?.message?.content;
    if (typeof content !== 'string') {
      return res.status(502).json({ error: 'Empty response from Ollama' });
    }

    res.json({
      reply: content,
      model: MODEL,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Ollama proxy running on http://localhost:${PORT} | model=${MODEL} -> ${OLLAMA_HOST}`);
});
