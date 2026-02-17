---
release type: minor
---

# Add /llms.txt endpoint for AI agent discovery

Cross-docs now auto-generates a `/llms.txt` endpoint from your documentation's navigation structure, following the [llms.txt convention](https://llmstxt.org/). This gives LLM agents a lightweight index of all available pages without bloating individual page responses.

Additionally, markdown responses (served to AI user agents) now include a small footer linking to `/llms.txt` so agents can discover other pages.

## What's new

- **`/llms.txt` route**: Auto-generated from your nav structure. Includes project title, description, and all doc pages organized by section. Works with both single-docs and multi-docs modes.
- **Markdown response footer**: Each page served as markdown now ends with a link to `/llms.txt` for discoverability.
- **`generate_llms_txt()` utility**: New public function to render any nav structure as llms.txt content.

The `/llms.txt` route is enabled automatically when `enable_markdown_response` is `True` (the default).
