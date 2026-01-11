"""Cross-Docs: Documentation framework."""

from __future__ import annotations

import json
from pathlib import Path
from typing import TYPE_CHECKING, Any

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import PlainTextResponse
from cross_inertia.fastapi import InertiaDep

from .markdown import load_markdown, load_raw_markdown
from .middleware import wants_markdown
from .navigation import generate_nav

if TYPE_CHECKING:
    from .config import APIPluginConfig, DocSet, DocsConfig


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
        # Multi-docs support
        self._doc_sets_meta: list[dict] | None = None
        self._nav_by_slug: dict[str, list[dict]] | None = None
        # API docs support
        self._api_data: dict[str, dict] | None = None
        self._api_nav: dict[str, list[dict]] | None = None

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

        if config.doc_sets:
            # Multi-docs mode (API routes are added internally before doc routes)
            self._build_multi_docs()
        else:
            # Single-docs mode (original behavior)
            self._build_single_docs()
            # Add API routes if configured (for single-docs mode only,
            # multi-docs handles this internally for correct route ordering)
            if config.api:
                self._build_api_routes()

    def _build_single_docs(self) -> None:
        """Build router for single documentation set (original behavior)."""
        config = self.config

        # Generate navigation
        self._nav = generate_nav(
            config.content_dir / "docs",
            base_path=config.prefix,
            section_order=config.section_order,
            index_page=config.index_page,
        )

        # Inject API Reference into nav if API docs are configured AND generated
        if config.api:
            for api_config in config.api:
                # Only add nav link if the JSON file exists
                if self._get_api_json_path(api_config).exists():
                    self._nav.append({
                        "title": "API Reference",
                        "items": [{
                            "title": "API Reference",
                            "href": f"{api_config.prefix.rstrip('/')}/",
                        }],
                    })
                    break  # Only add one API Reference section

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

    def _build_multi_docs(self) -> None:
        """Build router for multiple documentation sets."""
        config = self.config
        assert config.doc_sets is not None

        # Build navigation and metadata for each doc set
        self._doc_sets_meta = []
        self._nav_by_slug = {}

        for doc_set in config.doc_sets:
            # Determine content path for this doc set
            if doc_set.content_subdir:
                content_path = config.content_dir / "docs" / doc_set.content_subdir
            else:
                content_path = config.content_dir / "docs"

            # Determine URL prefix for this doc set
            if doc_set.slug:
                base_path = f"{config.prefix}/{doc_set.slug}"
            else:
                base_path = config.prefix

            # Generate nav for this doc set
            nav = generate_nav(
                content_path,
                base_path=base_path,
                section_order=doc_set.section_order or config.section_order,
                index_page=doc_set.index_page,
            )

            # Inject API Reference into nav if there's an API config for this doc set
            # AND the JSON file has been generated
            if config.api:
                for api_config in config.api:
                    if api_config.doc_set == doc_set.slug:
                        # Only add nav link if the JSON file exists
                        if self._get_api_json_path(api_config).exists():
                            nav.append({
                                "title": "API Reference",
                                "items": [{
                                    "title": "API Reference",
                                    "href": f"{api_config.prefix.rstrip('/')}/",
                                }],
                            })
                        break  # Only add one API Reference section per doc set

            self._nav_by_slug[doc_set.slug] = nav

            self._doc_sets_meta.append({
                "name": doc_set.name,
                "slug": doc_set.slug,
                "description": doc_set.description,
                "icon": doc_set.icon,
                "iconUrl": doc_set.icon_url,
                "prefix": base_path,
            })

        # Use first doc set's nav as default (for backwards compat with nav property)
        if config.doc_sets:
            self._nav = self._nav_by_slug.get(config.doc_sets[0].slug, [])

        # Create parent router
        self._router = APIRouter()

        if config.home.enabled:
            self._add_home_route()

        # Add API routes BEFORE doc set routes (API routes are more specific
        # and must be registered before the catch-all {path:path} routes)
        if config.api:
            self._build_api_routes()

        # Add routes for each doc set (non-empty slugs first to avoid catch-all issues)
        sorted_doc_sets = sorted(config.doc_sets, key=lambda ds: (ds.slug == "", ds.slug))
        for doc_set in sorted_doc_sets:
            self._create_docset_routes(doc_set)

    def _create_docset_routes(self, doc_set: "DocSet") -> None:
        """Create routes for a single doc set in multi-docs mode."""
        config = self.config
        docs_component = self.docs_component

        # Get navigation for this doc set
        nav = self._nav_by_slug[doc_set.slug]  # type: ignore
        doc_sets_meta = self._doc_sets_meta
        current_slug = doc_set.slug

        # Determine content path
        if doc_set.content_subdir:
            content_subpath = f"docs/{doc_set.content_subdir}"
        else:
            content_subpath = "docs"

        content_dir = config.content_dir

        # Determine route prefix
        if doc_set.slug:
            route_prefix = f"{config.prefix}/{doc_set.slug}"
        else:
            route_prefix = config.prefix

        def share_data(request: Request) -> dict:
            """Shared data available on all pages."""
            data: dict[str, Any] = {
                "nav": nav,
                "currentPath": str(request.url.path),
                "docSets": doc_sets_meta,
                "currentDocSet": current_slug,
            }
            if config.logo_url:
                data["logoUrl"] = config.logo_url
            if config.logo_inverted_url:
                data["logoInvertedUrl"] = config.logo_inverted_url
            data["footerLogoUrl"] = config.footer_logo_url or config.logo_url
            data["footerLogoInvertedUrl"] = config.footer_logo_inverted_url or config.logo_inverted_url
            if config.github_url:
                data["githubUrl"] = config.github_url
            if config.nav_links:
                data["navLinks"] = config.nav_links
            return data

        @self._router.get(f"{route_prefix}/{{path:path}}", tags=["docs"])  # type: ignore
        async def docs_page(
            path: str,
            request: Request,
            inertia: InertiaDep,
            _content_subpath: str = content_subpath,
            _index_page: str = doc_set.index_page,
            _share_data: Any = share_data,
        ):
            """Serve a docs page by path."""
            path = path.rstrip("/")
            if not path:
                path = _index_page

            doc_path = f"{_content_subpath}/{path}"

            # Return raw markdown if requested
            if config.enable_markdown_response and wants_markdown(request):
                return PlainTextResponse(
                    load_raw_markdown(content_dir, doc_path),
                    media_type="text/markdown",
                )

            content = load_markdown(content_dir, doc_path)
            props = {
                "content": content,
                **_share_data(request),
            }

            return inertia.render(
                docs_component,
                props,
                view_data={"page_title": content["title"]},
            )

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
            data["footerLogoInvertedUrl"] = config.footer_logo_inverted_url or config.logo_inverted_url
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
                "footerLogoInvertedUrl": config.footer_logo_inverted_url or config.logo_inverted_url,
                "githubUrl": config.github_url,
                "navLinks": config.nav_links,
            }

            return inertia.render(
                home_component,
                props,
                view_data={"page_title": home.title},
            )

    def _build_api_routes(self) -> None:
        """Build routes for API documentation.

        Loads pre-generated JSON files and creates routes to serve
        API documentation pages with a separate navigation sidebar.
        """
        config = self.config
        assert config.api is not None

        self._api_data = {}
        self._api_nav = {}

        for api_config in config.api:
            # Try to load pre-generated JSON
            api_json_path = self._get_api_json_path(api_config)
            if not api_json_path.exists():
                # Skip if not generated yet (user can run cross-docs generate-api)
                continue

            # Load the JSON data
            with open(api_json_path, encoding="utf-8") as f:
                api_data = json.load(f)

            package_name = api_data.get("name", api_config.package or "api")
            self._api_data[package_name] = api_data

            # Generate navigation from the data
            api_nav = self._generate_api_nav(api_data, api_config.prefix)
            self._api_nav[package_name] = api_nav

            # Create routes for this API
            self._create_api_routes(api_config, api_data, api_nav)

    def _get_api_json_path(self, api_config: "APIPluginConfig") -> Path:
        """Get the path to the generated API JSON file."""
        config = self.config
        output_dir = config.content_dir / api_config.output_dir

        # For Python plugin, the file is named after the package
        if api_config.plugin == "python" and api_config.package:
            return output_dir / f"{api_config.package}.json"

        # Generic fallback
        return output_dir / f"{api_config.plugin}.json"

    def _generate_api_nav(
        self, api_data: dict, prefix: str
    ) -> list[dict[str, Any]]:
        """Generate navigation structure from API data.

        Groups items by kind (Modules, Aliases) like strawberry.rocks.
        Uses dotted paths in URLs (e.g., /api-reference/package.module).
        """
        prefix = prefix.rstrip("/")
        package_name = api_data.get("name", "api")

        # Collect direct children by kind
        modules: list[dict[str, str]] = []
        aliases: list[dict[str, str]] = []

        members = api_data.get("members", {})

        for name, member in members.items():
            if not isinstance(member, dict):
                continue

            # Skip private members
            if name.startswith("_"):
                continue

            kind = member.get("kind", "")

            # Use dotted path: /prefix/package.name
            if kind == "module":
                modules.append({
                    "title": name,
                    "href": f"{prefix}/{package_name}.{name}",
                })
            elif kind == "alias":
                aliases.append({
                    "title": name,
                    "href": f"{prefix}/{package_name}.{name}",
                })

        # Sort alphabetically
        modules.sort(key=lambda x: x["title"].lower())
        aliases.sort(key=lambda x: x["title"].lower())

        # Build navigation sections
        nav: list[dict[str, Any]] = []

        # Add root package link at the top as a section
        nav.append({
            "title": "PACKAGE",
            "items": [{
                "title": package_name,
                "href": f"{prefix}/",
            }],
        })

        if modules:
            nav.append({"title": "MODULES", "items": modules})

        if aliases:
            nav.append({"title": "ALIASES", "items": aliases})

        return nav

    def _collect_api_nav_items(
        self,
        obj: dict[str, Any],
        prefix: str,
        current_path: str,
        classes: list[dict[str, str]],
        functions: list[dict[str, str]],
    ) -> None:
        """Recursively collect navigation items from API data.

        Groups items by kind (classes, functions).
        Note: This method is kept for backwards compatibility but
        _generate_api_nav now uses a simpler approach.
        """
        members = obj.get("members", {})
        obj_kind = obj.get("kind", "")

        for name, member in members.items():
            if not isinstance(member, dict):
                continue

            member_kind = member.get("kind", "")
            member_path = f"{current_path}.{name}"

            if member_kind == "module":
                # Recurse into submodules
                self._collect_api_nav_items(
                    member,
                    prefix,
                    member_path,
                    classes,
                    functions,
                )
            elif member_kind == "class":
                classes.append({
                    "title": name,
                    "href": f"{prefix}/{current_path.replace('.', '/')}/{name}/",
                })
            elif member_kind == "function":
                # Only add module-level functions
                if obj_kind == "module":
                    functions.append({
                        "title": name,
                        "href": f"{prefix}/{current_path.replace('.', '/')}/{name}/",
                    })

    def _create_api_routes(
        self,
        api_config: "APIPluginConfig",
        api_data: dict,
        api_nav: list[dict],
    ) -> None:
        """Create routes for serving API documentation pages."""
        config = self.config
        prefix = api_config.prefix.rstrip("/")
        component = api_config.component
        package_name = api_data.get("name", api_config.package or "api")
        doc_set_slug = api_config.doc_set
        doc_sets_meta = self._doc_sets_meta

        # Create shared data function
        def make_share_data(request: Request) -> dict[str, Any]:
            """Shared data for API pages."""
            data: dict[str, Any] = {
                "apiNav": api_nav,
                "currentPath": str(request.url.path),
            }
            # Include doc set info if available
            if doc_sets_meta:
                data["docSets"] = doc_sets_meta
            if doc_set_slug is not None:
                data["currentDocSet"] = doc_set_slug
            if config.logo_url:
                data["logoUrl"] = config.logo_url
            if config.logo_inverted_url:
                data["logoInvertedUrl"] = config.logo_inverted_url
            data["footerLogoUrl"] = config.footer_logo_url or config.logo_url
            data["footerLogoInvertedUrl"] = (
                config.footer_logo_inverted_url or config.logo_inverted_url
            )
            if config.github_url:
                data["githubUrl"] = config.github_url
            if config.nav_links:
                data["navLinks"] = config.nav_links
            return data

        # Route for API index
        @self._router.get(f"{prefix}/", tags=["api"])  # type: ignore
        async def api_index(
            request: Request,
            inertia: InertiaDep,
            _api_data: dict = api_data,
            _component: str = component,
            _share_data: Any = make_share_data,
            _package_name: str = package_name,
        ):
            """Serve API documentation index."""
            props = {
                "apiData": _api_data,
                "currentModule": _package_name,
                "prefix": prefix,
                **_share_data(request),
            }
            return inertia.render(
                _component,
                props,
                view_data={"page_title": f"API Reference - {_package_name}"},
            )

        # Route for specific API paths using dotted notation
        # e.g., /api-reference/strawberry.enum or /api-reference/strawberry.dataloader.DataLoader
        @self._router.get(f"{prefix}/{{dotted_path:path}}", tags=["api"])  # type: ignore
        async def api_page(
            dotted_path: str,
            request: Request,
            inertia: InertiaDep,
            _api_data: dict = api_data,
            _component: str = component,
            _share_data: Any = make_share_data,
            _package_name: str = package_name,
        ):
            """Serve API documentation page for a specific dotted path."""
            dotted_path = dotted_path.rstrip("/")
            if not dotted_path:
                dotted_path = _package_name

            # Split dotted path into parts
            # e.g., "strawberry.dataloader.DataLoader" -> ["strawberry", "dataloader", "DataLoader"]
            path_parts = dotted_path.split(".")

            # Try to find the item in the API data
            item = self._find_api_item(_api_data, path_parts)

            if item is None:
                raise HTTPException(status_code=404, detail="API item not found")

            props = {
                "apiData": _api_data,
                "currentItem": item,
                "currentPath": str(request.url.path),
                "currentModule": path_parts[0] if path_parts else _package_name,
                "prefix": prefix,
                **_share_data(request),
            }

            # Determine page title
            item_name = item.get("name", path_parts[-1] if path_parts else _package_name)
            item_kind = item.get("kind", "")
            title = f"{item_name} - API Reference"
            if item_kind:
                title = f"{item_name} ({item_kind}) - API Reference"

            return inertia.render(
                _component,
                props,
                view_data={"page_title": title},
            )

    def _find_api_item(
        self, data: dict, path_parts: list[str]
    ) -> dict[str, Any] | None:
        """Find an item in the API data by path.

        Args:
            data: The API data dictionary.
            path_parts: List of path components (e.g., ["cross_docs", "config", "DocsConfig"]).

        Returns:
            The found item or None.
        """
        if not path_parts:
            return data

        current = data
        package_name = data.get("name", "")

        for i, part in enumerate(path_parts):
            # Skip the package name if it matches
            if i == 0 and part == package_name:
                continue

            # Look in members
            members = current.get("members", {})
            if part in members:
                current = members[part]
            else:
                return None

        return current
