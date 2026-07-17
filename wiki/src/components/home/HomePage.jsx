import { useCallback, useEffect, useState } from "react";
import { MapIcon, MoonIcon, SearchIcon, SunIcon, XIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchCharacters } from "../../data/characterApi.js";
import { useSiteTheme } from "../../hooks/useSiteTheme.js";
import { BrandMark } from "../brand/BrandMark.jsx";
import { CharacterCard } from "./CharacterCard.jsx";

const PAGE_SIZE = 30;
const SERIES = Object.freeze([
  { id: "all", label: "All characters" },
  { id: "game-of-thrones", label: "Game of Thrones" },
  { id: "house-of-the-dragon", label: "House of the Dragon" },
  { id: "a-knight-of-the-seven-kingdoms", label: "A Knight of the Seven Kingdoms" },
]);

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [series, setSeries] = useState(searchParams.get("series") || "all");
  const [characters, setCharacters] = useState([]);
  const [total, setTotal] = useState(0);
  const [published, setPublished] = useState(0);
  const [deferred, setDeferred] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const { theme, toggleTheme } = useSiteTheme();

  useEffect(() => {
    document.title = "Map of Ice and Fire";
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const next = {};
    if (search) next.search = search;
    if (series !== "all") next.series = series;
    setSearchParams(next, { replace: true });
  }, [search, series, setSearchParams]);

  const loadCharacters = useCallback(async ({ append = false, offset = 0, signal } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      const payload = await fetchCharacters(
        { search, series, limit: PAGE_SIZE, offset },
        signal,
      );
      setCharacters((current) => append
        ? [...current, ...(payload.characters ?? [])]
        : (payload.characters ?? []));
      setTotal(payload.total ?? 0);
      setPublished(payload.published ?? 0);
      setDeferred(payload.deferred ?? 0);
    } catch (reason) {
      if (reason.name !== "AbortError") setError(reason.message);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [search, series]);

  useEffect(() => {
    const controller = new AbortController();
    loadCharacters({ signal: controller.signal });
    return () => controller.abort();
  }, [loadCharacters]);

  return (
    <main className={`catalog-page site-theme site-theme-${theme}`} data-theme={theme}>
      <a className="skip-link" href="#character-catalogue">Skip to characters</a>
      <header className="site-header">
        <Link to="/home" className="site-brand" aria-label="Map of Ice and Fire home">
          <BrandMark />
          <strong>Map of Ice and Fire</strong>
        </Link>
        <nav aria-label="Primary navigation">
          <Link
            to="/"
            aria-label="Realm map"
            className={cn(buttonVariants({ variant: "ghost" }), "site-nav-link")}
          >
            <MapIcon data-icon="inline-start" aria-hidden="true" />
            <span>Realm map</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="site-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark"
              ? <SunIcon data-icon="inline-start" aria-hidden="true" />
              : <MoonIcon data-icon="inline-start" aria-hidden="true" />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </Button>
        </nav>
      </header>

      <section className="catalog-index" id="character-catalogue">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">The journeys of the known world</p>
            <h1>Trace every character. Season by season.</h1>
            <p>
              Choose a character to follow their path across Westeros and Essos.
              Every available journey is built from verified on-screen appearances.
            </p>
          </div>
          <div className="catalog-count" aria-label={`${total} matching characters`}>
            <strong>{loading ? "—" : total}</strong>
            <span>characters</span>
            {!loading && (
              <small>
                {published} ready{deferred ? ` · ${deferred} ongoing` : ""}
              </small>
            )}
          </div>
        </div>

        <div className="catalog-toolbar" aria-label="Character filters">
          <label className="catalog-search">
            <span>Find a character</span>
            <div>
              <SearchIcon aria-hidden="true" />
              <input
                type="search"
                name="character-search"
                autoComplete="off"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="A name, title, or house…"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search">
                  <XIcon aria-hidden="true" />
                </button>
              )}
            </div>
          </label>

          <div className="series-tabs" role="group" aria-label="Filter by television series">
            {SERIES.map((item) => (
              <button
                type="button"
                key={item.id}
                className={series === item.id ? "is-active" : ""}
                aria-pressed={series === item.id}
                onClick={() => setSeries(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-result-heading" aria-live="polite">
          <p>{search ? <>Results for <strong>“{search}”</strong></> : "Character catalogue"}</p>
          <span>{total} {total === 1 ? "character" : "characters"}</span>
        </div>

        {error ? (
          <div className="catalog-error" role="alert">
            <p className="eyebrow">The map room is unavailable</p>
            <h2>Characters could not be loaded.</h2>
            <p>Please check your connection and try again. Your filters will stay in place.</p>
            <Button type="button" variant="outline" onClick={() => loadCharacters()}>
              Try again
            </Button>
          </div>
        ) : loading ? (
          <div
            className="catalog-loading"
            role="status"
            aria-live="polite"
            aria-label="Loading characters…"
          >
            {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
          </div>
        ) : characters.length ? (
          <>
            <div className="character-grid">
              {characters.map((character, index) => (
                <CharacterCard
                  key={`${character.seriesSlug}-${character.characterSlug}`}
                  character={character}
                  index={index}
                />
              ))}
            </div>
            {characters.length < total && (
              <Button
                type="button"
                variant="outline"
                className="load-more"
                disabled={loadingMore}
                onClick={() => loadCharacters({ append: true, offset: characters.length })}
              >
                {loadingMore ? "Loading more characters…" : "Show more characters"}
              </Button>
            )}
          </>
        ) : (
          <div className="catalog-empty">
            <span aria-hidden="true">∅</span>
            <h2>No matching character was found.</h2>
            <p>Try a shorter name, another title, or a different series.</p>
          </div>
        )}
      </section>

      <footer className="site-footer">
        <span>Map of Ice and Fire</span>
        <p>Season-by-season journeys across the known world.</p>
        <Link to="/">View the realm map ↑</Link>
      </footer>
    </main>
  );
}
