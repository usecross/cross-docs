# cross-docs

Python backend utilities for Cross-Docs documentation framework.

## Installation

```bash
uv add cross-docs
# or
pip install cross-docs
```

## Usage

```python
from pathlib import Path
from fastapi import FastAPI, Request
from cross_docs import (
    generate_nav,
    create_docs_handler,
    strip_trailing_slash_middleware,
)
from inertia.fastapi import InertiaDep

app = FastAPI()
app.middleware("http")(strip_trailing_slash_middleware)

CONTENT_DIR = Path("content")
NAV = generate_nav(CONTENT_DIR / "docs")

docs_handler = create_docs_handler(CONTENT_DIR, NAV)

@app.get("/docs")
async def docs_index(request: Request, inertia: InertiaDep):
    return await docs_handler(request, inertia)

@app.get("/docs/{path:path}")
async def docs_page(path: str, request: Request, inertia: InertiaDep):
    return await docs_handler(request, inertia, path=path)
```

## API

### Markdown Utilities

- `parse_frontmatter(content: str)` - Parse YAML frontmatter
- `load_markdown(content_dir: Path, path: str)` - Load and parse markdown
- `load_raw_markdown(content_dir: Path, path: str)` - Load raw markdown

### Navigation

- `generate_nav(docs_dir, base_path, section_order, index_page)` - Generate nav from files

### Middleware

- `strip_trailing_slash_middleware` - Redirect trailing slashes
- `wants_markdown(request)` - Check Accept header for markdown

### Routes

- `create_docs_handler(...)` - Create a docs route handler

## License

MIT
