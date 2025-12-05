"""FastAPI middleware for cross-docs."""

from fastapi import Request
from fastapi.responses import RedirectResponse


async def strip_trailing_slash_middleware(request: Request, call_next):
    """Redirect URLs with trailing slashes to non-trailing slash versions.

    Use as FastAPI middleware:
        app.middleware("http")(strip_trailing_slash_middleware)

    Args:
        request: FastAPI request
        call_next: Next middleware in chain

    Returns:
        RedirectResponse for trailing slash URLs, otherwise next response
    """
    path = request.url.path
    if path != "/" and path.endswith("/"):
        # Build new URL without trailing slash
        new_path = path.rstrip("/")
        if request.url.query:
            new_path = f"{new_path}?{request.url.query}"
        return RedirectResponse(url=new_path, status_code=308)
    return await call_next(request)


def wants_markdown(request: Request) -> bool:
    """Check if the request prefers markdown content.

    Useful for AI tools like Claude Code that request raw markdown
    via Accept: text/markdown header.

    Args:
        request: FastAPI request

    Returns:
        True if Accept header contains text/markdown
    """
    accept = request.headers.get("accept", "")
    return "text/markdown" in accept
