import { Head, Link } from '@inertiajs/react'
import { createContext, useContext, useState, type ReactNode } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface HomeFeature {
  title: string
  description: ReactNode
}

export interface HomePageContextValue {
  title: string
  tagline: string
  description: string
  installCommand: string
  ctaText: string
  ctaHref: string
  features: HomeFeature[]
  logoUrl?: string
  heroLogoUrl?: string
  footerLogoUrl?: string
  githubUrl?: string
  navLinks: Array<{ label: string; href: string }>
}

export interface HomePageProps extends Omit<HomePageContextValue, 'navLinks'> {
  navLinks?: Array<{ label: string; href: string }>
  children?: ReactNode
}

export interface HomeFeaturesProps {
  renderFeature?: (
    feature: HomeFeature,
    index: number,
    DefaultFeature: typeof HomeFeatureItem
  ) => ReactNode
}

export interface HomeFeatureItemProps {
  feature: HomeFeature
  index: number
  totalFeatures: number
}

// ============================================================================
// Context
// ============================================================================

const HomePageContext = createContext<HomePageContextValue | null>(null)

function useHomePage(): HomePageContextValue {
  const context = useContext(HomePageContext)
  if (!context) {
    throw new Error('HomePage sub-components must be used within <HomePage>')
  }
  return context
}

// ============================================================================
// Utility Components
// ============================================================================

function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copyToClipboard}
      className="group relative flex items-center bg-black border border-black px-4 h-14 font-mono text-sm text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
    >
      <span className="text-primary-500 mr-2">$</span>
      <span>{command}</span>
      <svg
        className={`ml-4 w-4 h-4 transition ${copied ? 'text-green-400' : 'opacity-50 group-hover:opacity-100'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      <span
        className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded transition-opacity duration-300 whitespace-nowrap ${
          copied ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Copied!
      </span>
    </button>
  )
}

function GitHubIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Navigation header for the homepage.
 */
export function HomeHeader() {
  const { title, logoUrl, navLinks, githubUrl } = useHomePage()

  return (
    <nav className="fixed w-full z-50 bg-white border-b border-gray-200">
      <div className="px-4 lg:px-10">
        <div className="flex justify-between h-16 items-center">
          {logoUrl ? (
            <Link href="/" className="flex items-center">
              <img src={logoUrl} alt={title} className="h-8" />
            </Link>
          ) : (
            <Link href="/" className="font-bold text-lg">
              {title}
            </Link>
          )}
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-black font-medium hover:text-primary-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-primary-500 transition-colors"
              >
                <GitHubIcon />
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

/**
 * Hero section with title, tagline, description, and CTA.
 * If heroLogoUrl is provided, displays an image instead of text title.
 */
export function HomeHero() {
  const { title, tagline, description, ctaText, ctaHref, installCommand, heroLogoUrl } = useHomePage()

  return (
    <section className="pt-16">
      <div className="px-4 lg:px-10 py-16 lg:py-24">
        <div className="max-w-4xl">
          <div className="mb-4 text-sm font-mono uppercase tracking-widest text-gray-500">
            {tagline}
          </div>
          {heroLogoUrl ? (
            <h1 className="mb-6 lg:mb-8">
              <img
                src={heroLogoUrl}
                alt={title}
                className="h-auto w-auto max-w-[580px]"
              />
            </h1>
          ) : (
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              {title}
            </h1>
          )}
          <p className="text-xl lg:text-2xl text-gray-700 max-w-2xl leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center px-8 h-14 bg-black text-white font-bold text-lg hover:bg-primary-500 transition-colors border border-black"
            >
              {ctaText}
            </Link>
            {installCommand && <InstallCommand command={installCommand} />}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Single feature item within the features grid.
 */
export function HomeFeatureItem({ feature, index, totalFeatures }: HomeFeatureItemProps) {
  return (
    <div
      className={`p-4 lg:p-10 border-b sm:border-b border-gray-200 ${
        index % 2 === 0 ? 'sm:border-r' : ''
      } ${index >= totalFeatures - 2 ? 'sm:border-b-0' : ''} ${
        index === totalFeatures - 1 && totalFeatures % 2 === 1 ? 'border-b-0' : ''
      }`}
    >
      <div className="text-5xl font-bold text-primary-500 mb-4">
        {String(index + 1).padStart(2, '0')}
      </div>
      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
      <p className="text-gray-600">{feature.description}</p>
    </div>
  )
}

/**
 * Features section with customizable feature rendering.
 */
export function HomeFeatures({ renderFeature }: HomeFeaturesProps = {}) {
  const { title, features } = useHomePage()

  if (features.length === 0) {
    return null
  }

  return (
    <section className="border-t border-gray-200">
      <div className="grid grid-cols-12">
        <div className="col-span-12 lg:col-span-4 p-4 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-4">
            Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Why {title}?
          </h2>
        </div>

        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2">
          {features.map((feature, index) =>
            renderFeature ? (
              <div key={index}>
                {renderFeature(feature, index, HomeFeatureItem)}
              </div>
            ) : (
              <HomeFeatureItem
                key={index}
                feature={feature}
                index={index}
                totalFeatures={features.length}
              />
            )
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Call-to-action section.
 */
export function HomeCTA() {
  const { ctaHref } = useHomePage()

  return (
    <section className="border-t border-gray-200">
      <div className="grid grid-cols-12 items-center">
        <div className="col-span-12 lg:col-span-8 p-4 lg:p-10">
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
            Ready to start?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Get up and running in minutes. Check out our documentation to learn more.
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white font-bold text-lg hover:bg-black transition-colors border border-primary-500 hover:border-black"
          >
            Read the Docs
          </Link>
        </div>
        <Link
          href={ctaHref}
          className="col-span-12 lg:col-span-4 h-full bg-primary-500 hidden lg:flex items-center justify-center p-4 lg:p-10 hover:bg-black transition-colors min-h-[200px]"
        >
          <div className="text-white text-8xl font-bold">&rarr;</div>
        </Link>
      </div>
    </section>
  )
}

/**
 * Footer section.
 */
export function HomeFooter() {
  const { title, logoUrl, footerLogoUrl, navLinks, githubUrl } = useHomePage()

  return (
    <footer className="border-t border-gray-200 py-8">
      <div className="px-4 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
        {(footerLogoUrl || logoUrl) && (
          <Link href="/">
            <img src={footerLogoUrl || logoUrl} alt={title} className="h-6" />
          </Link>
        )}
        <div className="flex gap-8 text-sm text-gray-600">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-black transition-colors">
              {link.label}
            </Link>
          ))}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}

/**
 * Default layout when no children are provided.
 */
function DefaultHomeLayout() {
  return (
    <>
      <HomeHeader />
      <HomeHero />
      <HomeFeatures />
      <HomeCTA />
      <HomeFooter />
    </>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Homepage component for documentation sites.
 *
 * Can be used in two ways:
 *
 * 1. Simple - everything from config:
 * ```tsx
 * <HomePage {...props} />
 * ```
 *
 * 2. Composable - full control via children:
 * ```tsx
 * <HomePage {...props}>
 *   <HomePage.Header />
 *   <HomePage.Hero />
 *   <MyCustomSection />
 *   <HomePage.Features renderFeature={(feature, i, Default) => (
 *     <Default feature={feature} index={i} totalFeatures={4} />
 *   )} />
 *   <HomePage.CTA />
 *   <HomePage.Footer />
 * </HomePage>
 * ```
 */
export function HomePage({
  children,
  navLinks = [],
  ...props
}: HomePageProps) {
  const contextValue: HomePageContextValue = {
    ...props,
    navLinks,
  }

  return (
    <HomePageContext.Provider value={contextValue}>
      <div className="min-h-screen bg-white">
        <Head title={props.title} />
        {children || <DefaultHomeLayout />}
      </div>
    </HomePageContext.Provider>
  )
}

// Attach sub-components for compound component pattern
HomePage.Header = HomeHeader
HomePage.Hero = HomeHero
HomePage.Features = HomeFeatures
HomePage.Feature = HomeFeatureItem
HomePage.CTA = HomeCTA
HomePage.Footer = HomeFooter
