export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', model: 'llama3.2:1b' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { messages, system } = await request.json();
        if (!Array.isArray(messages)) {
          return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
        }
        
        const chatMessages = [];
        if (system) {
          chatMessages.push({ role: 'system', content: system });
        }
        chatMessages.push(...messages);
        
        // Forward to local Ollama API
        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3.2:1b',
            messages: chatMessages,
            stream: false,
            options: { temperature: 0.7, num_predict: 2048 },
          }),
        });
        
        const data = await response.json();
        if (!response.ok) {
          return new Response(JSON.stringify({ error: data.message || 'ollama error' }), { status: 500 });
        }
        
        return new Response(JSON.stringify({ 
          reply: data.message?.content || '',
          model: 'llama3.2:1b'
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }
    
    return env.ASSETS.fetch(request);
  }
};
