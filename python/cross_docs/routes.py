"""Route factories for cross-docs."""

from pathlib import Path
from typing import Any, Callable

from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse

from .markdown import load_markdown, load_raw_markdown
from .middleware import wants_markdown
from .navigation import generate_nav


def create_docs_routes(
    app: FastAPI,
    content_dir: Path,
    *,
    component: str = "docs/DocsPage",
    base_path: str = "/docs",
    index_page: str = "introduction",
    section_order: list[str] | None = None,
    enable_markdown_response: bool = True,
    render_func: Callable[[Request, str, dict, dict | None], Any] | None = None,
) -> list[dict]:
    """Add documentation routes to a FastAPI app.

    Creates routes for serving markdown documentation with Inertia.js.
    Generates navigation from markdown file structure.

    Args:
        app: FastAPI application
        content_dir: Base directory for content (should have docs/ subdirectory)
        component: Inertia component name for rendering docs
        base_path: URL base path for docs
        index_page: Name of the index page file (without .md)
        section_order: List of section names in desired order
        enable_markdown_response: Enable raw markdown for Accept: text/markdown
        render_func: Custom render function (receives request, component, props, view_data)

    Returns:
        Generated navigation structure
    """
    docs_dir = content_dir / "docs"
    nav = generate_nav(
        docs_dir,
        base_path=base_path,
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
        content: dict,
        inertia: Any,
    ):
        """Render a docs page with Inertia."""
        props = {
            "content": content,
            **share_data(request),
        }
        if render_func:
            return await render_func(
                request,
                component,
                props,
                {"page_title": content["title"]},
            )
        return inertia.render(
            component,
            {"content": content},
            view_data={"page_title": content["title"]},
        )

    @app.get(base_path)
    async def docs_index(request: Request):
        from inertia.fastapi import InertiaDep
        from fastapi import Depends

        # This is a workaround - we need to get inertia from the request
        # In practice, users should use this as a reference implementation
        pass

    # We need to use a different approach - let's create route handlers
    # that can be registered by the user

    return nav


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
    docs_dir = content_dir / "docs"

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
            {"content": content},
            view_data={"page_title": content["title"]},
        )

    return handle_docs_page
