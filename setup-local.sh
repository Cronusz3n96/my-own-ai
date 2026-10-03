#!/bin/bash
echo "Setting up local Ollama..."
OLLAMA_HOST=127.0.0.1:11434 ollama serve &
sleep 5
OLLAMA_HOST=127.0.0.1:11434 ollama pull llama3.2:1b
echo "Done. Ollama running on port 11434 with llama3.2:1b"
