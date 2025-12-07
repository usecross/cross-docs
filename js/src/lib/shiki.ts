import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

let highlighterPromise: Promise<HighlighterCore> | null = null

// Default languages to load
const defaultLangs = [
  import('shiki/langs/python.mjs'),
  import('shiki/langs/javascript.mjs'),
  import('shiki/langs/typescript.mjs'),
  import('shiki/langs/tsx.mjs'),
  import('shiki/langs/jsx.mjs'),
  import('shiki/langs/bash.mjs'),
  import('shiki/langs/shellscript.mjs'),
  import('shiki/langs/json.mjs'),
  import('shiki/langs/html.mjs'),
  import('shiki/langs/css.mjs'),
  import('shiki/langs/yaml.mjs'),
  import('shiki/langs/toml.mjs'),
  import('shiki/langs/markdown.mjs'),
]

// Default theme
const defaultTheme = import('shiki/themes/github-dark-dimmed.mjs')

/**
 * Get or create a Shiki highlighter instance.
 * Uses a singleton pattern to avoid creating multiple highlighters.
 */
export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [defaultTheme],
      langs: defaultLangs,
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}

/**
 * Configure the highlighter with custom themes and languages.
 * Must be called before getHighlighter() is first called.
 */
export function configureHighlighter(options: {
  theme?: Promise<any>
  langs?: Promise<any>[]
}): void {
  if (highlighterPromise) {
    console.warn('configureHighlighter called after highlighter was created')
    return
  }

  highlighterPromise = createHighlighterCore({
    themes: [options.theme ?? defaultTheme],
    langs: options.langs ?? defaultLangs,
    engine: createJavaScriptRegexEngine(),
  })
}
