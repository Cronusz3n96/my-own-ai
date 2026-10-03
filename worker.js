export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' }), {
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
        
        const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: chatMessages,
          stream: false,
        });
        
        return new Response(JSON.stringify({ 
          reply: response.response || response.text || '',
          model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }
    
    // Serve static files from assets
    return env.ASSETS.fetch(request);
  }
};
