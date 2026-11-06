# Ideation runs as a Claude scheduled task, not as custom code

Ideation (and other judgement-heavy writing steps) runs as a weekly Claude scheduled task that uses the existing AMOURIQ skills (`video-idea`, `content-machine`) and the project brand documents, instead of a custom Node/Python service calling an LLM API. Custom code in this repo is reserved for steps that must talk to external APIs (asset generation tools, platform publishing). We chose this because the brand voice, Claim Guardrail and SKU rules already live in skills and project docs that Claude reads natively, so re-implementing them as prompts inside a service would duplicate and drift from the source of truth.

## Considered Options

- **Claude-only (no code):** rejected because publishing and media generation need authenticated API calls, retries and scheduling that are better owned by code.
- **Custom service for everything:** rejected for Ideation because it would need its own copy of brand/claim rules and its own model plumbing, for no gain in quality.
