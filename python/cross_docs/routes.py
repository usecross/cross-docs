"""Route factories for cross-docs."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable

from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse
from inertia.fastapi import InertiaDep

from .markdown import load_markdown, load_raw_markdown
from .middleware import wants_markdown
from .navigation import generate_nav

if TYPE_CHECKING:
    from .config import DocsConfig


def create_docs_router(
    content_dir: Path,
    *,
    component: str = "docs/DocsPage",
    prefix: str = "/docs",
    index_page: str = "introduction",
    section_order: list[str] | None = None,
    enable_markdown_response: bool = True,
    render_with_ssr: Callable[..., Any] | None = None,
    logo_url: str | None = None,
    logo_inverted_url: str | None = None,
    footer_logo_url: str | None = None,
    github_url: str | None = None,
    nav_links: list[dict[str, str]] | None = None,
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
        logo_url: URL for the site logo (SVG recommended)
        logo_inverted_url: URL for inverted/dark logo variant
        footer_logo_url: URL for the footer logo (extended/full version)
        github_url: GitHub repository URL (shows GitHub icon in nav)
        nav_links: Additional navigation links [{"label": "...", "href": "..."}]

    Returns:
        FastAPI APIRouter with docs routes configured
    """
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
        data: dict[str, Any] = {
            "nav": nav,
            "currentPath": str(request.url.path),
        }
        if logo_url:
            data["logoUrl"] = logo_url
        if logo_inverted_url:
            data["logoInvertedUrl"] = logo_inverted_url
        data["footerLogoUrl"] = footer_logo_url or logo_url
        if github_url:
            data["githubUrl"] = github_url
        if nav_links:
            data["navLinks"] = nav_links
        return data

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

    @router.get("/{path:path}")
    async def docs_page(path: str, request: Request, inertia: InertiaDep):
        """Serve a docs page by path."""
        # Strip trailing slash from path for file lookup
        path = path.rstrip("/")
        # Empty path means index page
        if not path:
            path = index_page
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


def create_home_route(
    config: DocsConfig | None = None,
    *,
    component: str = "HomePage",
    render_with_ssr: Callable[..., Any] | None = None,
) -> Callable:
    """Create a home page route handler.

    Use this to add a homepage to your FastAPI app:

        from cross_docs import create_home_route, load_config

        config = load_config()
        home_handler = create_home_route(config)

        @app.get("/")
        async def home(request: Request, inertia: InertiaDep):
            return await home_handler(request, inertia)

    Args:
        config: DocsConfig instance. If None, loads from pyproject.toml.
        component: Inertia component name for the homepage.
        render_with_ssr: Optional SSR render function for server-side rendering.

    Returns:
        Async handler function for the home route.
    """
    from .config import load_config

    if config is None:
        config = load_config()

    home = config.home

    async def handle_home(request: Request, inertia: Any):
        props = {
            "title": home.title,
            "tagline": home.tagline,
            "description": home.description,
            "installCommand": home.install_command,
            "ctaText": home.cta_text,
            "ctaHref": home.cta_href,
            "features": home.features,
            "logoUrl": config.logo_url,
            "footerLogoUrl": config.footer_logo_url or config.logo_url,
            "githubUrl": config.github_url,
            "navLinks": config.nav_links,
        }

        if render_with_ssr:
            return await render_with_ssr(
                request,
                component,
                props,
                view_data={"page_title": home.title},
            )

        return inertia.render(
            component,
            props,
            view_data={"page_title": home.title},
        )

    return handle_home


def create_docs_router_from_config(
    config: DocsConfig | None = None,
    *,
    render_with_ssr: Callable[..., Any] | None = None,
) -> APIRouter:
    """Create a FastAPI router from DocsConfig.

    This is the simplest way to add docs using pyproject.toml config:

        from cross_docs import create_docs_router_from_config, load_config

        config = load_config()
        router = create_docs_router_from_config(config)
        app.include_router(router)

    Or even simpler (auto-loads from pyproject.toml):

        from cross_docs import create_docs_router_from_config

        router = create_docs_router_from_config()
        app.include_router(router)

    Args:
        config: DocsConfig instance. If None, loads from pyproject.toml.
        render_with_ssr: Optional SSR render function for server-side rendering.

    Returns:
        FastAPI APIRouter with docs routes configured.
    """
    from .config import load_config

    if config is None:
        config = load_config()

    return create_docs_router(
        config.content_dir,
        component=config.component,
        prefix=config.prefix,
        index_page=config.index_page,
        section_order=config.section_order,
        enable_markdown_response=config.enable_markdown_response,
        render_with_ssr=render_with_ssr,
        logo_url=config.logo_url,
        logo_inverted_url=config.logo_inverted_url,
        footer_logo_url=config.footer_logo_url,
        github_url=config.github_url,
        nav_links=config.nav_links,
    )
