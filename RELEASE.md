---
release type: minor
---

# Dark Mode Support

Add dark mode support with theme toggle and configurable footer logos.

## New Features

- **Theme Toggle**: New `ThemeProvider` and `ThemeToggle` components for light/dark/system theme switching
- **Dark Footer Logo**: New `footer_logo_inverted_url` config option for dark mode footer logos
- **Theme Hook**: New `useTheme()` hook to access current theme state in custom components

## Configuration

```toml
[tool.cross-docs]
footer_logo_url = "/static/logo.svg"
footer_logo_inverted_url = "/static/logo-dark.svg"
```

## Developer Experience

- Vite now uses source files directly for hot-reloading during development
