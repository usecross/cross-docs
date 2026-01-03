---
release type: patch
---

Fix missing bottom margin on code blocks

Code blocks using `not-prose` were missing bottom margins, causing headings that follow to appear cramped against the code block. Added `mb-6` to the CodeBlock wrapper for proper spacing.

Also removes accidentally committed `website/frontend/dist/` build artifacts from git tracking.
