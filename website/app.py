"""Cross-Docs documentation website."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from inertia.fastapi import InertiaMiddleware, InertiaResponse, get_inertia_response

from cross_docs import create_docs_router, strip_trailing_slash_middleware

# Configure Inertia before creating the app
_response = get_inertia_response()
_response.template_dir = str(Path(__file__).parent / "templates")
_response.vite_dev_url = "http://localhost:5173"
_response.vite_entry = "app.tsx"

app = FastAPI(title="Cross-Docs", docs_url="/api/docs", redoc_url="/api/redoc")

# Inertia middleware
app.add_middleware(InertiaMiddleware, share=lambda request: {})

# Strip trailing slashes
app.middleware("http")(strip_trailing_slash_middleware)

# Serve static files
static_dir = Path(__file__).parent / "frontend" / "dist"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

# Documentation routes
content_dir = Path(__file__).parent / "content"
docs_router = create_docs_router(
    content_dir,
    prefix="/docs",
    index_page="introduction",
    section_order=["Getting Started", "Guide", "API Reference"],
    github_url="https://github.com/usecross/cross-docs",
    nav_links=[
        {"label": "Docs", "href": "/docs"},
        {"label": "GitHub", "href": "https://github.com/usecross/cross-docs"},
    ],
)
app.include_router(docs_router)


@app.get("/")
async def home():
    """Redirect to docs."""
    from fastapi.responses import RedirectResponse

    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
