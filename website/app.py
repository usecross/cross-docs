"""Cross-Docs documentation website."""

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from inertia.fastapi import InertiaMiddleware, InertiaDep, get_inertia_response
from inertia.fastapi.experimental import inertia_lifespan

from cross_docs import create_docs_router_from_config, create_home_route, load_config

# Load config from pyproject.toml
config = load_config()

# Configure Inertia before creating the app
_response = get_inertia_response()
_response.template_dir = str(Path(__file__).parent / "templates")
_response.vite_dev_url = "http://localhost:5173"
_response.vite_entry = "app.tsx"

app = FastAPI(title="Cross-Docs", docs_url="/api/docs", redoc_url="/api/redoc", lifespan=inertia_lifespan)

# Inertia middleware
app.add_middleware(InertiaMiddleware)

# Serve static files
static_dir = Path(__file__).parent / "frontend" / "dist"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")
app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")

# Documentation routes (loaded from pyproject.toml config)
docs_router = create_docs_router_from_config(config)
app.include_router(docs_router)

# Home page route
home_handler = create_home_route(config)


@app.get("/")
async def home(request: Request, inertia: InertiaDep):
    """Render the homepage."""
    return await home_handler(request, inertia)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
