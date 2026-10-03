export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        model: 'MyOwnAI-Wild',
        type: 'wild'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { messages } = await request.json();
        if (!Array.isArray(messages)) {
          return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
        }
        
        const rawMessages = messages.map(m => ({ role: m.role, content: m.content }));
        
        const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: rawMessages,
          stream: false,
          temperature: 0.9,
          top_p: 0.9,
        });
        
        return new Response(JSON.stringify({ 
          reply: response.response || response.text || '',
          model: 'MyOwnAI-Wild'
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
