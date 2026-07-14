import { useCallback, useEffect, useMemo, useState } from "react";
import { MapIcon, MoonIcon, SunIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCollections, fetchWikiEntries } from "../../data/houseApi.js";
import { useWikiTheme } from "../../hooks/useWikiTheme.js";
import { WikiEntryCard } from "./WikiEntryCard.jsx";
import { WikiEntryPanel } from "./WikiEntryPanel.jsx";

const PAGE_SIZE = 18;

export function WikiPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [collection, setCollection] = useState(searchParams.get("collection") || "all");
  const [collections, setCollections] = useState([]);
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [opener, setOpener] = useState(null);
  const { theme, toggleTheme } = useWikiTheme();

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const next = {};
    if (search) next.search = search;
    if (collection !== "all") next.collection = collection;
    setSearchParams(next, { replace: true });
  }, [collection, search, setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCollections(controller.signal)
      .then((payload) => setCollections(payload.collections ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const loadEntries = useCallback(async (offset = 0, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const payload = await fetchWikiEntries(
        { search, collection, limit: PAGE_SIZE, offset },
      );
      setEntries((current) => append ? [...current, ...payload.entries] : payload.entries);
      setTotal(payload.total);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [collection, search]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const totalRecords = useMemo(
    () => collections.reduce((sum, item) => sum + item.count, 0),
    [collections],
  );

  const openEntry = useCallback((entry, button) => {
    setSelected(entry);
    setOpener(button);
  }, []);

  const closeEntry = useCallback(() => setSelected(null), []);

  return (
    <main className={`wiki-page wiki-theme wiki-theme-${theme}`} data-theme={theme}>
      <a className="skip-link" href="#archive-index">Skip to archive</a>
      <header className="wiki-header">
        <Link to="/" className="wiki-brand" aria-label="A Wiki of Ice and Fire home">
          <span>W</span>
          <strong>A Wiki of Ice and Fire</strong>
        </Link>
        <nav aria-label="Archive navigation">
          <Link to="/map">
            <MapIcon aria-hidden="true" />
            Map
          </Link>
          <button
            type="button"
            className="wiki-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </nav>
      </header>

      <section className="archive-index" id="archive-index">
        <div className="archive-heading">
          <div>
            <p className="eyebrow">The known record</p>
            <h1>Explore the archive.</h1>
            <p>Characters, houses, and chronicles from the local collection.</p>
          </div>
          <div className="archive-count" aria-label={`${totalRecords} archive records`}>
            <strong>{totalRecords || "—"}</strong>
            <span>records</span>
          </div>
        </div>

        <div className="archive-toolbar" aria-label="Archive filters">
          <label className="archive-search">
            <span>Search the archive</span>
            <div>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
              <input
                type="search"
                name="archive-search"
                autoComplete="off"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="A name, house, or title…"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search">×</button>
              )}
            </div>
          </label>

          <div className="collection-tabs" role="group" aria-label="Filter by collection">
            <button
              type="button"
              className={collection === "all" ? "is-active" : ""}
              onClick={() => setCollection("all")}
            >
              All <small>{totalRecords}</small>
            </button>
            {collections.map((item) => (
              <button
                type="button"
                key={item.id}
                className={collection === item.id ? "is-active" : ""}
                onClick={() => setCollection(item.id)}
              >
                {item.label} <small>{item.count}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="archive-result-heading" aria-live="polite">
          <p>{search ? <>Results for <strong>“{search}”</strong></> : "Archive entries"}</p>
          <span>{total} {total === 1 ? "entry" : "entries"}</span>
        </div>

        {error ? (
          <div className="wiki-error" role="alert">
            <p className="eyebrow">Archive unavailable</p>
            <h2>The record could not be read.</h2>
            <p>{error}</p>
            <button type="button" onClick={() => loadEntries()}>Try again</button>
          </div>
        ) : loading ? (
          <div className="folio-loading" aria-label="Loading archive records">
            {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
          </div>
        ) : entries.length ? (
          <>
            <div className="wiki-grid">
              {entries.map((entry, index) => (
                <WikiEntryCard
                  key={`${entry.recordId}-${index}`}
                  entry={entry}
                  index={index}
                  onOpen={openEntry}
                />
              ))}
            </div>
            {entries.length < total && (
              <button
                type="button"
                className="load-more"
                disabled={loadingMore}
                onClick={() => loadEntries(entries.length, true)}
              >
                {loadingMore ? "Opening more folios…" : "Open the next folios"}
              </button>
            )}
          </>
        ) : (
          <div className="wiki-empty">
            <span aria-hidden="true">∅</span>
            <h2>No matching record was found.</h2>
            <p>Try a shorter name, a house, or another chronicle.</p>
          </div>
        )}
      </section>

      <footer className="wiki-footer">
        <span>A Wiki of Ice and Fire</span>
        <p>A private, SQLite-backed archive.</p>
        <Link to="/map">View the map ↑</Link>
      </footer>

      {selected && (
        <WikiEntryPanel
          entry={selected}
          onClose={closeEntry}
          opener={opener}
          theme={theme}
        />
      )}
    </main>
  );
}
