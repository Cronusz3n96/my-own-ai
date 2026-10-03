# My Own AI

A minimal AI chat interface built from scratch.

## Local Development (Express Server)

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your API key (if needed)
3. Start: `npm start`
4. Visit: http://localhost:3001

## Deploy to Cloudflare Workers

1. Deploy: `npx wrangler deploy`
2. Your app will be live on Cloudflare Workers with AI binding

## Tech Stack

- Frontend: Vanilla HTML/CSS/JS
- Backend: Express (local) or Cloudflare Workers
- AI: Cloudflare Workers AI (deployed) or Cerebras API (local)
