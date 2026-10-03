export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', model: env.MODEL || 'llama3.1' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { messages, system, model, temperature = 0.7 } = await request.json();
        if (!Array.isArray(messages)) {
          return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
        }
        
        const chatMessages = [];
        if (system) {
          chatMessages.push({ role: 'system', content: system });
        }
        chatMessages.push(...messages);
        
        const selectedModel = model || env.MODEL || 'llama3.1';
        const OLLAMA_HOST = env.OLLAMA_HOST || 'http://localhost:11434';
        
        const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
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
          return new Response(JSON.stringify({ error: data.message || 'ollama error' }), { status: 500 });
        }
        
        return new Response(JSON.stringify({ 
          reply: data.message?.content || '',
          model: selectedModel
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
