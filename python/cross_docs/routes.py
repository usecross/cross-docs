"""Cross-Docs: Documentation framework."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse
from inertia.fastapi import InertiaDep

from .markdown import load_markdown, load_raw_markdown
from .middleware import wants_markdown
from .navigation import generate_nav

if TYPE_CHECKING:
    from .config import DocsConfig


class CrossDocs:
    """Documentation site with optional homepage.

    The main entry point for cross-docs. Loads configuration from
    pyproject.toml and creates routes for docs and homepage.

    Example:
        from cross_docs import CrossDocs

        docs = CrossDocs()
        docs.mount(app)

        # Or with explicit config:
        from cross_docs import CrossDocs, load_config

        config = load_config()
        docs = CrossDocs(config)
        app.include_router(docs.router)

        # Override component names:
        docs = CrossDocs(
            docs_component="custom/DocsPage",
            home_component="custom/HomePage",
        )
    """

    def __init__(
        self,
        config: DocsConfig | None = None,
        *,
        docs_component: str | None = None,
        home_component: str | None = None,
    ):
        """Initialize CrossDocs.

        Args:
            config: DocsConfig instance. If None, loads from pyproject.toml.
            docs_component: Override the docs page component name.
            home_component: Override the home page component name.
        """
        from .config import load_config

        if config is None:
            config = load_config()

        self.config = config
        self.docs_component = docs_component or config.component
        self.home_component = home_component or config.home.component
        self._router: APIRouter | None = None
        self._nav: list[dict] | None = None

    @property
    def nav(self) -> list[dict]:
        """Navigation structure for the docs."""
        if self._nav is None:
            self._build()
        return self._nav  # type: ignore

    @property
    def router(self) -> APIRouter:
        """FastAPI router with all routes."""
        if self._router is None:
            self._build()
        return self._router  # type: ignore

    def mount(self, app: Any) -> None:
        """Mount docs on a FastAPI application.

        Args:
            app: FastAPI application instance.
        """
        app.include_router(self.router)

    def _build(self) -> None:
        """Build the router and navigation."""
        config = self.config

        # Generate navigation
        self._nav = generate_nav(
            config.content_dir / "docs",
            base_path=config.prefix,
            section_order=config.section_order,
            index_page=config.index_page,
        )

        # Create docs router
        docs_router = self._create_docs_router()

        # If home is not enabled, just use the docs router
        if not config.home.enabled:
            self._router = docs_router
            return

        # Create parent router with home + docs
        self._router = APIRouter()
        self._add_home_route()
        self._router.include_router(docs_router)

    def _create_docs_router(self) -> APIRouter:
        """Create the docs router."""
        config = self.config
        nav = self._nav
        docs_component = self.docs_component

        router = APIRouter(prefix=config.prefix, tags=["docs"])
        content_dir = config.content_dir

        def share_data(request: Request) -> dict:
            """Shared data available on all pages."""
            data: dict[str, Any] = {
                "nav": nav,
                "currentPath": str(request.url.path),
            }
            if config.logo_url:
                data["logoUrl"] = config.logo_url
            if config.logo_inverted_url:
                data["logoInvertedUrl"] = config.logo_inverted_url
            data["footerLogoUrl"] = config.footer_logo_url or config.logo_url
            if config.github_url:
                data["githubUrl"] = config.github_url
            if config.nav_links:
                data["navLinks"] = config.nav_links
            return data

        @router.get("/{path:path}")
        async def docs_page(path: str, request: Request, inertia: InertiaDep):
            """Serve a docs page by path."""
            path = path.rstrip("/")
            if not path:
                path = config.index_page

            doc_path = f"docs/{path}"

            # Return raw markdown if requested
            if config.enable_markdown_response and wants_markdown(request):
                return PlainTextResponse(
                    load_raw_markdown(content_dir, doc_path),
                    media_type="text/markdown",
                )

            content = load_markdown(content_dir, doc_path)
            props = {
                "content": content,
                **share_data(request),
            }

            return inertia.render(
                docs_component,
                props,
                view_data={"page_title": content["title"]},
            )

        return router

    def _add_home_route(self) -> None:
        """Add the home route to the router."""
        config = self.config
        home = config.home
        home_component = self.home_component

        @self._router.get("/", tags=["home"])  # type: ignore
        async def home_page(request: Request, inertia: InertiaDep):
            """Serve the homepage."""
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

            return inertia.render(
                home_component,
                props,
                view_data={"page_title": home.title},
            )
