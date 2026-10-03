export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        model: 'MyOwnAI-Coder-v1',
        type: 'coder'
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
        
        const coderSystem = `You are MyOwnAI-Coder, an elite software engineer and coding assistant.

You excel at:
- Writing clean, efficient, production-ready code
- Debugging and fixing complex issues
- Explaining technical concepts clearly
- Following best practices and conventions
- Writing comprehensive tests
- Providing complete, final implementations
- Anticipating edge cases

Always provide:
- Complete, working code (no placeholders or TODOs unless explicitly requested)
- Proper error handling
- Clear comments only when necessary
- Well-structured, readable code
- Correct syntax and idiomatic patterns for the chosen language

Respond directly with the solution. No unnecessary preamble.`;
        
        const chatMessages = [];
        chatMessages.push({ role: 'system', content: system || coderSystem });
        chatMessages.push(...messages);
        
        const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: chatMessages,
          stream: false,
          temperature: 0.3,
          top_p: 0.9,
        });
        
        return new Response(JSON.stringify({ 
          reply: response.response || response.text || '',
          model: 'MyOwnAI-Coder-v1',
          type: 'coder'
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
