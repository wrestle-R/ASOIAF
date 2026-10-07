import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  ListIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "../ui/button.jsx";
import { SiteHeader } from "../brand/SiteHeader.jsx";
import { useSiteTheme } from "../../hooks/useSiteTheme.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { DOC_ARTICLES, DOC_GROUPS, searchArticles } from "../../data/docs.js";

function CodeBlock({ code, label }) {
  const [copyState, setCopyState] = useState("idle");
  useEffect(() => {
    if (copyState === "idle") return undefined;
    const timer = window.setTimeout(() => setCopyState("idle"), 2500);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="docs-code">
      <div className="docs-code-header">
        <span>{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={copy}
        >
          {copyState === "copied" ? (
            <CheckIcon data-icon="inline-start" aria-hidden="true" />
          ) : (
            <CopyIcon data-icon="inline-start" aria-hidden="true" />
          )}
          {copyState === "copied" ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      <span className="docs-copy-status" role="status">
        {copyState === "failed"
          ? "Copy unavailable. Select the commands to copy them manually."
          : copyState === "copied"
            ? "Commands copied."
            : ""}
      </span>
    </div>
  );
}

function RouteLegend() {
  return (
    <figure className="docs-route-legend">
      <svg
        viewBox="0 0 640 130"
        role="img"
        aria-label="Schematic route connecting three recorded stops in order; not an exact travel path"
      >
        <path
          className="legend-grid"
          d="M0 30H640M0 65H640M0 100H640M80 0V130M200 0V130M320 0V130M440 0V130M560 0V130"
        />
        <path
          className="legend-route"
          d="M70 55C170 15 240 110 320 72S470 25 570 55"
        />
        <g className="legend-stops">
          <circle cx="70" cy="55" r="6" />
          <circle cx="320" cy="72" r="6" />
          <circle cx="570" cy="55" r="6" />
        </g>
        <g className="legend-labels">
          <text x="70" y="94" textAnchor="middle">
            First stop
          </text>
          <text x="320" y="110" textAnchor="middle">
            Next appearance
          </text>
          <text x="570" y="94" textAnchor="middle">
            Later stop
          </text>
        </g>
      </svg>
      <figcaption>
        Recorded stops, connected in order. The line is schematic.
      </figcaption>
    </figure>
  );
}

export function DocsPage() {
  const { articleSlug = "getting-started" } = useParams();
  const location = useLocation();
  const articleIndex = DOC_ARTICLES.findIndex(
    (candidate) => candidate.slug === articleSlug,
  );
  const article = DOC_ARTICLES[articleIndex];
  const { theme, toggleTheme } = useSiteTheme();
  const mobile = useMediaQuery("(max-width: 850px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const results = searchArticles(query);
  const searching = Boolean(query.trim());
  const previous = DOC_ARTICLES[articleIndex - 1];
  const next = DOC_ARTICLES[articleIndex + 1];

  useEffect(() => {
    document.title = `${article?.label || "Article not found"} | A Map of Ice and Fire`;
    setMenuOpen(false);
    setQuery("");
  }, [article]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (location.hash) {
        let id;
        try {
          id = decodeURIComponent(location.hash.slice(1));
        } catch {
          return;
        }
        document.getElementById(id)?.scrollIntoView();
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [articleSlug, location.hash]);

  useEffect(() => {
    const shortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (
        event.key === "Escape" &&
        document.activeElement === searchRef.current
      )
        setQuery("");
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  return (
    <div
      className={`docs-page site-theme site-theme-${theme}`}
      data-theme={theme}
    >
      <a className="skip-link" href="#archive-article">
        Skip to article
      </a>
      <SiteHeader theme={theme} toggleTheme={toggleTheme} section="docs" />
      <div className="docs-layout">
        <aside className="docs-sidebar" aria-label="Archive navigation">
          <div className="docs-sidebar-title">
            <p className="eyebrow">The archives</p>
            {mobile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-expanded={menuOpen}
                aria-controls="archive-navigation"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <ListIcon data-icon="inline-start" aria-hidden="true" />
                Contents
              </Button>
            )}
          </div>
          <label className="docs-search">
            <SearchIcon aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              aria-label="Search the archives"
              placeholder="Search the archives…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Clear archive search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                <XIcon aria-hidden="true" />
              </Button>
            )}
          </label>
          <span className="docs-search-hint">
            Search every article · Ctrl / ⌘ K
          </span>
          <nav id="archive-navigation" hidden={mobile && !menuOpen}>
            {DOC_GROUPS.map((group) => (
              <div className="docs-nav-group" key={group}>
                <p>{group}</p>
                {DOC_ARTICLES.filter(
                  (candidate) => candidate.group === group,
                ).map((candidate) => (
                  <Link
                    key={candidate.slug}
                    to={`/docs/${candidate.slug}`}
                    aria-current={
                      candidate.slug === articleSlug ? "page" : undefined
                    }
                  >
                    {candidate.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <Link className="docs-return" to="/home">
            <ArrowLeftIcon aria-hidden="true" />
            Back to characters
          </Link>
        </aside>
        <main id="archive-article" className="docs-article" tabIndex={-1}>
          {searching ? (
            <>
              <p className="eyebrow">Search the archives</p>
              <h1>Find your way.</h1>
              <p className="docs-lead" role="status">
                {results.length} {results.length === 1 ? "article" : "articles"}{" "}
                matching “{query.trim()}”
              </p>
              <div className="docs-search-results">
                {results.map((result) => (
                  <Link
                    to={`/docs/${result.slug}`}
                    key={result.slug}
                    onClick={() => setQuery("")}
                  >
                    <span className="eyebrow">{result.group}</span>
                    <h2>
                      {result.label}
                      <ArrowRightIcon aria-hidden="true" />
                    </h2>
                    <p>{result.description}</p>
                  </Link>
                ))}
                {!results.length && (
                  <p>
                    Try a term such as “coverage”, “keyboard”, or “database”.
                  </p>
                )}
              </div>
            </>
          ) : article ? (
            <>
              <nav className="docs-breadcrumb" aria-label="Breadcrumb">
                <Link to="/docs">The archives</Link>
                <span aria-hidden="true">/</span>
                <span>{article.group}</span>
              </nav>
              <h1>{article.title}</h1>
              <p className="docs-lead">{article.description}</p>
              <div className="docs-article-rule" />
              {article.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="docs-section"
                  aria-labelledby={`${section.id}-title`}
                >
                  <h2 id={`${section.id}-title`}>
                    <a
                      href={`#${section.id}`}
                      aria-label={`Link to ${section.title}`}
                    >
                      {section.title}
                      <span className="docs-anchor" aria-hidden="true">
                        #
                      </span>
                    </a>
                  </h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.steps && (
                    <ol className="docs-steps">
                      {section.steps.map((step) => (
                        <li key={step.title}>
                          <div>
                            <h3>{step.title}</h3>
                            <p>{step.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                  {section.items && (
                    <ul className="docs-items">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.code && (
                    <CodeBlock
                      key={section.code}
                      code={section.code}
                      label={section.codeLabel}
                    />
                  )}
                  {section.diagram && <RouteLegend />}
                  {section.link && (
                    <Link className="atlas-text-link" to={section.link.to}>
                      {section.link.label}
                      <ArrowRightIcon aria-hidden="true" />
                    </Link>
                  )}
                  {section.externalLink && (
                    <a
                      className="atlas-text-link"
                      href={section.externalLink.href}
                    >
                      {section.externalLink.label}
                      <ArrowRightIcon aria-hidden="true" />
                    </a>
                  )}
                </section>
              ))}
              <nav className="docs-pagination" aria-label="Article navigation">
                {previous ? (
                  <Link to={`/docs/${previous.slug}`}>
                    <span>Previous article</span>
                    <strong>
                      <ArrowLeftIcon aria-hidden="true" />
                      {previous.label}
                    </strong>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link to={`/docs/${next.slug}`}>
                    <span>Next article</span>
                    <strong>
                      {next.label}
                      <ArrowRightIcon aria-hidden="true" />
                    </strong>
                  </Link>
                )}
              </nav>
            </>
          ) : (
            <>
              <p className="eyebrow">Uncharted pages · 404</p>
              <h1>This page is missing from the archives.</h1>
              <p className="docs-lead">
                Search for another subject or return to the first guide.
              </p>
              <Link className="atlas-text-link" to="/docs">
                Open the getting started guide
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </>
          )}
        </main>
        {article && !searching && (
          <aside className="docs-outline">
            <nav aria-label="On this page">
              <p className="eyebrow">On this page</p>
              {article.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
            <p className="docs-outline-note">
              A Map of Ice and Fire
              <br />A record of the known world.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
