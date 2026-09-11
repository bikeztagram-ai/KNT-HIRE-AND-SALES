#!/usr/bin/env bash
set -euo pipefail
# KNT AutoBot uses a local coding model only. No OpenAI/Gemini API is required.
if ! command -v ollama >/dev/null 2>&1; then curl -fsSL https://ollama.com/install.sh | sh; fi
export OLLAMA_HOST="127.0.0.1:11434"
nohup ollama serve >/tmp/knt-ollama.log 2>&1 &
for i in $(seq 1 30); do if curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then break; fi; sleep 2; done
MODEL="${LOCAL_AI_MODEL:-qwen2.5-coder:7b}"
if [[ "$MODEL" == "qwen2.5-coder:1.5b" || "$MODEL" == "qwen2.5-coder:1.5b-instruct" ]]; then MODEL="qwen2.5-coder:7b"; fi
echo "[autobot] pulling local KNT coding model: $MODEL"
if ! ollama pull "$MODEL"; then
  if [[ "$MODEL" == "qwen2.5-coder:7b" && -z "${LOCAL_AI_MODEL:-}" ]]; then MODEL="qwen2.5-coder:3b"; ollama pull "$MODEL"; else exit 1; fi
fi
curl -fsS http://127.0.0.1:11434/api/chat -H 'Content-Type: application/json' -d "{\"model\":\"$MODEL\",\"stream\":false,\"messages\":[{\"role\":\"user\",\"content\":\"Reply with READY only.\"}]}" >/tmp/knt-ollama-smoke.json
echo "LOCAL_AI_READY=1" >> "$GITHUB_ENV"
echo "OLLAMA_HOST=http://127.0.0.1:11434" >> "$GITHUB_ENV"
echo "LOCAL_AI_MODEL=$MODEL" >> "$GITHUB_ENV"
echo "[autobot] KNT local Qwen brain is ready; no paid coding-model API is required."
