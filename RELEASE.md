---
release type: minor
---

# Improved docs layout and customization

## New Features

- Add `header` prop to DocsLayout for custom header components (can be a function or React element)
- Add `headerHeight` prop (defaults to 64px) for configurable header height
- Export `MobileMenuButton` component for use in custom headers

## Layout Improvements

- Content area now has a fixed max-width instead of expanding to fill available space
- Table of Contents positioned with consistent 20px gap from content
- TOC sticky position aligned with content padding (24px below header)
- Increased sidebar width for better readability
- TOC font size increased to match sidebar styling for visual consistency
- TOC now accepts additional props for flexible styling
