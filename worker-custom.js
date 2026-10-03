export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        model: 'MyOwnAI-v1',
        type: 'custom'
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { messages, system } = await request.json();
        if (!Array.isArray(messages)) {
          return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
        }
        
        const customSystem = `You are MyOwnAI, a custom AI model built from scratch by the user. 
You have your own identity - MyOwnAI. 
Be helpful, concise, and direct. 
You don't need to mention you're based on other models unless asked.
Respond in a natural, engaging way.`;
        
        const chatMessages = [];
        chatMessages.push({ role: 'system', content: system || customSystem });
        chatMessages.push(...messages);
        
        const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: chatMessages,
          stream: false,
        });
        
        return new Response(JSON.stringify({ 
          reply: response.response || response.text || '',
          model: 'MyOwnAI-v1',
          type: 'custom'
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
