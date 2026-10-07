import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, SearchIcon, XIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchCharacters } from "../../data/characterApi.js";
import { useSiteTheme } from "../../hooks/useSiteTheme.js";
import { SiteHeader } from "../brand/SiteHeader.jsx";
import blobAssets from "../../data/blobAssets.json";
import { CharacterCard } from "./CharacterCard.jsx";

const PAGE_SIZE = 30;
const SERIES = Object.freeze([
  { id: "all", label: "All characters" },
  { id: "game-of-thrones", label: "Game of Thrones" },
  { id: "house-of-the-dragon", label: "House of the Dragon" },
  {
    id: "a-knight-of-the-seven-kingdoms",
    label: "A Knight of the Seven Kingdoms",
  },
]);

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const search = searchParams.get("search") || "";
  const requestedSeries = searchParams.get("series");
  const series = SERIES.some((item) => item.id === requestedSeries)
    ? requestedSeries
    : "all";
  const urlReadyOnly = searchParams.get("status") === "published";
  const [readyOnly, setReadyOnly] = useState(urlReadyOnly);
  const requestRef = useRef(null);
  const [characters, setCharacters] = useState([]);
  const [total, setTotal] = useState(0);
  const [published, setPublished] = useState(0);
  const [deferred, setDeferred] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const { theme, toggleTheme } = useSiteTheme();

  useEffect(() => {
    document.title = "A Map of Ice and Fire";
  }, []);

  useEffect(() => {
    if (searchInput.trim() === search) return undefined;
    const timer = window.setTimeout(() => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (searchInput.trim()) next.set("search", searchInput.trim());
          else next.delete("search");
          return next;
        },
        { replace: true },
      );
    }, 280);
    return () => window.clearTimeout(timer);
  }, [searchInput, search, setSearchParams]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setReadyOnly(urlReadyOnly);
  }, [urlReadyOnly]);

  function updateFilter(key, value) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }

  const loadCharacters = useCallback(
    async ({ append = false, offset = 0, signal } = {}) => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      const abort = () => controller.abort();
      signal?.addEventListener("abort", abort, { once: true });
      if (signal?.aborted) controller.abort();
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setLoadingMore(false);
      }
      setError(null);

      try {
        const payload = await fetchCharacters(
          {
            search,
            series,
            status: readyOnly ? "published" : undefined,
            limit: PAGE_SIZE,
            offset,
          },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setCharacters((current) =>
          append
            ? [...current, ...(payload.characters ?? [])]
            : (payload.characters ?? []),
        );
        setTotal(payload.total ?? 0);
        setPublished(payload.published ?? 0);
        setDeferred(payload.deferred ?? 0);
      } catch (reason) {
        if (reason.name !== "AbortError") setError(reason.message);
      } finally {
        signal?.removeEventListener("abort", abort);
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [search, series, readyOnly],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadCharacters({ signal: controller.signal });
    return () => {
      controller.abort();
      requestRef.current?.abort();
    };
  }, [loadCharacters]);

  return (
    <main
      className={`catalog-page site-theme site-theme-${theme}`}
      data-theme={theme}
    >
      <a className="skip-link" href="#character-catalogue">
        Skip to characters
      </a>
      <SiteHeader
        theme={theme}
        toggleTheme={toggleTheme}
        section="characters"
      />

      <section className="catalog-index" id="character-catalogue">
        <div className="catalog-heading">
          <img
            className="catalog-map-art"
            src={blobAssets.maps.world.url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width="1484"
            height="1060"
          />
          <div className="catalog-heading-copy">
            <p className="eyebrow">The known world</p>
            <h1>
              Every life <br />
              leaves a trail.
            </h1>
            <p>
              Follow the characters of Westeros and Essos, season by season.
              Their stories unfold. The map remembers.
            </p>
            <Link className="atlas-text-link" to="/">
              Step inside the realm map <ArrowRightIcon aria-hidden="true" />
            </Link>
          </div>
          <div
            className="catalog-count"
            aria-label={`${total} matching characters`}
          >
            <strong>{loading ? "—" : total}</strong>
            <span>matching characters</span>
            {!loading && (
              <small>
                {published} ready{deferred ? ` · ${deferred} deferred` : ""}
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
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                >
                  <XIcon aria-hidden="true" />
                </button>
              )}
            </div>
          </label>

          <div
            className="series-tabs"
            role="group"
            aria-label="Filter by television series"
          >
            {SERIES.map((item) => (
              <button
                type="button"
                key={item.id}
                className={series === item.id ? "is-active" : ""}
                aria-pressed={series === item.id}
                onClick={() =>
                  updateFilter("series", item.id === "all" ? null : item.id)
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-result-heading" aria-live="polite">
          <p>
            {search ? (
              <>
                Results for <strong>“{search}”</strong>
              </>
            ) : (
              "The character index"
            )}{" "}
            <span className="catalog-result-count">
              {loading ? "…" : total}
            </span>
          </p>
          <label className="ready-filter">
            <input
              type="checkbox"
              checked={readyOnly}
              onChange={(event) => {
                setReadyOnly(event.target.checked);
                updateFilter(
                  "status",
                  event.target.checked ? "published" : null,
                );
              }}
            />
            Ready journeys only
          </label>
        </div>

        {error ? (
          <div className="catalog-error" role="alert">
            <p className="eyebrow">The map room is unavailable</p>
            <h2>Characters could not be loaded.</h2>
            <p>
              Please check your connection and try again. Your filters will stay
              in place.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => loadCharacters()}
            >
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
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} />
            ))}
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
                onClick={() =>
                  loadCharacters({ append: true, offset: characters.length })
                }
              >
                {loadingMore
                  ? "Loading more characters…"
                  : "Show more characters"}
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
        <span>A Map of Ice and Fire</span>
        <p>Season-by-season journeys across the known world.</p>
        <Link to="/docs">A guide to the known world ↗</Link>
      </footer>
    </main>
  );
}
