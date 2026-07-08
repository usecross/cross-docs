"""Tests for cross_docs.routes module."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from cross_docs import CrossDocs
from cross_docs.config import DocSet, DocsConfig


def write_doc(path: Path, title: str) -> None:
    """Write a minimal markdown document with frontmatter."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"---\ntitle: {title}\n---\n\n# {title}\n")


def build_multi_doc_app(content_dir: Path) -> FastAPI:
    """Build a minimal multi-doc CrossDocs app."""
    write_doc(content_dir / "docs" / "strawberry" / "index.md", "Main")
    write_doc(content_dir / "docs" / "django" / "index.md", "Django")
    write_doc(content_dir / "docs" / "django" / "guide" / "queries.md", "Queries")

    config = DocsConfig(
        content_dir=content_dir,
        prefix="/docs",
        index_page="index",
        doc_sets=[
            DocSet(
                name="Strawberry",
                slug="",
                content_subdir="strawberry",
                index_page="index",
            ),
            DocSet(
                name="Strawberry Django",
                slug="django",
                content_subdir="django",
                index_page="index",
            ),
        ],
    )

    app = FastAPI(docs_url=None, redoc_url=None)
    CrossDocs(config=config).mount(app)
    return app


def test_multi_doc_set_indexes_work_without_trailing_slash(tmp_path: Path):
    """Doc-set index pages should not be shadowed by the root catch-all route."""
    client = TestClient(build_multi_doc_app(tmp_path / "content"))

    for path, title in [("/docs", "Main"), ("/docs/django", "Django")]:
        response = client.get(path, headers={"Accept": "text/markdown"})

        assert response.status_code == 200
        assert f"# {title}" in response.text


def test_multi_doc_set_nested_pages_still_work(tmp_path: Path):
    """Nested pages should still resolve within the matching doc set."""
    client = TestClient(build_multi_doc_app(tmp_path / "content"))

    response = client.get("/docs/django/guide/queries", headers={"Accept": "text/markdown"})

    assert response.status_code == 200
    assert "# Queries" in response.text
