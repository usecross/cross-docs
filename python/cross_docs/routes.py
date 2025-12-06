"""Route factories for cross-docs."""

from pathlib import Path
from typing import Any, Callable

from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse

from .markdown import load_markdown, load_raw_markdown
from .middleware import wants_markdown
from .navigation import generate_nav


def create_docs_router(
    content_dir: Path,
    *,
    component: str = "docs/DocsPage",
    prefix: str = "/docs",
    index_page: str = "introduction",
    section_order: list[str] | None = None,
    enable_markdown_response: bool = True,
    render_with_ssr: Callable[..., Any] | None = None,
) -> APIRouter:
    """Create a FastAPI router for documentation pages.

    This is the simplest way to add docs to your FastAPI app:

        from cross_docs import create_docs_router

        router = create_docs_router(Path("content"))
        app.include_router(router)

    Args:
        content_dir: Base directory for content (should have docs/ subdirectory)
        component: Inertia component name for rendering docs
        prefix: URL prefix for docs routes (default: "/docs")
        index_page: Name of the index page file (without .md)
        section_order: List of section names in desired order
        enable_markdown_response: Enable raw markdown for Accept: text/markdown
        render_with_ssr: Optional SSR render function for server-side rendering

    Returns:
        FastAPI APIRouter with docs routes configured
    """
    from inertia.fastapi import InertiaDep

    router = APIRouter(prefix=prefix, tags=["docs"])
    docs_dir = content_dir / "docs"

    # Generate navigation from file structure
    nav = generate_nav(
        docs_dir,
        base_path=prefix,
        section_order=section_order,
        index_page=index_page,
    )

    def share_data(request: Request) -> dict:
        """Shared data available on all pages."""
        return {
            "nav": nav,
            "currentPath": str(request.url.path),
        }

    async def render_page(
        request: Request,
        inertia: InertiaDep,
        doc_path: str,
    ):
        """Render a docs page."""
        # Return raw markdown if requested
        if enable_markdown_response and wants_markdown(request):
            return PlainTextResponse(
                load_raw_markdown(content_dir, doc_path),
                media_type="text/markdown",
            )

        content = load_markdown(content_dir, doc_path)
        props = {
            "content": content,
            **share_data(request),
        }

        if render_with_ssr:
            return await render_with_ssr(
                request,
                component,
                props,
                view_data={"page_title": content["title"]},
            )

        return inertia.render(
            component,
            props,
            view_data={"page_title": content["title"]},
        )

    @router.get("")
    async def docs_index(request: Request, inertia: InertiaDep):
        """Serve the docs index page."""
        return await render_page(request, inertia, f"docs/{index_page}")

    @router.get("/{path:path}")
    async def docs_page(path: str, request: Request, inertia: InertiaDep):
        """Serve a docs page by path."""
        return await render_page(request, inertia, f"docs/{path}")

    # Attach nav to router for external access if needed
    router.nav = nav  # type: ignore

    return router


def create_docs_handler(
    content_dir: Path,
    nav: list[dict],
    *,
    component: str = "docs/DocsPage",
    base_path: str = "/docs",
    index_page: str = "introduction",
    enable_markdown_response: bool = True,
):
    """Create a docs page handler function.

    Use this for more control over route registration:

        nav = generate_nav(content_dir / "docs")
        handler = create_docs_handler(content_dir, nav)

        @app.get("/docs")
        async def docs_index(request: Request, inertia: InertiaDep):
            return await handler(request, inertia)

        @app.get("/docs/{path:path}")
        async def docs_page(path: str, request: Request, inertia: InertiaDep):
            return await handler(request, inertia, path=path)

    Args:
        content_dir: Base directory for content
        nav: Navigation structure (from generate_nav)
        component: Inertia component name
        base_path: URL base path
        index_page: Index page filename
        enable_markdown_response: Enable raw markdown responses

    Returns:
        Async handler function for docs routes
    """

    def share_data(request: Request) -> dict:
        return {
            "nav": nav,
            "currentPath": str(request.url.path),
        }

    async def handle_docs_page(
        request: Request,
        inertia: Any,
        path: str | None = None,
        render_with_ssr: Callable | None = None,
    ):
        """Handle a docs page request.

        Args:
            request: FastAPI request
            inertia: Inertia dependency
            path: Page path (None for index)
            render_with_ssr: Optional SSR render function
        """
        doc_path = f"docs/{path}" if path else f"docs/{index_page}"

        # Return raw markdown if requested
        if enable_markdown_response and wants_markdown(request):
            return PlainTextResponse(
                load_raw_markdown(content_dir, doc_path),
                media_type="text/markdown",
            )

        content = load_markdown(content_dir, doc_path)
        props = {
            "content": content,
            **share_data(request),
        }

        if render_with_ssr:
            return await render_with_ssr(
                request,
                component,
                props,
                view_data={"page_title": content["title"]},
            )

        return inertia.render(
            component,
            props,
            view_data={"page_title": content["title"]},
        )

    return handle_docs_page
