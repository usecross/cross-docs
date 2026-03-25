"""Cross-Docs documentation website."""

from pathlib import Path

from cross_docs import CrossDocs
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from cross_inertia import configure_inertia
from cross_inertia.fastapi.experimental import inertia_lifespan

configure_inertia(vite_entry="app.tsx")

app = FastAPI(
    title="Cross-Docs",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=inertia_lifespan,
)

app.mount(
    "/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static"
)

# Documentation routes (loaded from pyproject.toml config)
docs = CrossDocs()
docs.mount(app)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
