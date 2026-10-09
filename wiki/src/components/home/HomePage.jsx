import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, SearchIcon, XIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchCharacters } from "../../data/characterApi.js";
import { useSiteTheme } from "../../hooks/useSiteTheme.js";
import { SiteHeader } from "../brand/SiteHeader.jsx";
import { SiteFooter } from "../brand/SiteFooter.jsx";
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

const FEATURED_CHARACTERS = [
  { slug: "jon-snow", name: "Jon Snow", house: "House Stark" },
  { slug: "daenerys-targaryen", name: "Daenerys", house: "House Targaryen" },
  { slug: "arya-stark", name: "Arya Stark", house: "House Stark" },
];

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

  function clearFilters() {
    setSearchInput("");
    setReadyOnly(false);
    setSearchParams({});
  }

  const hasFilters = Boolean(search || series !== "all" || readyOnly);

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
      <SiteHeader theme={theme} toggleTheme={toggleTheme} />

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
            <p className="eyebrow">
              The known world <span /> The character catalogue
            </p>
            <h1>
              Every life <br />
              leaves a trail.
            </h1>
            <p>
              From Winterfell to Dragonstone, follow the people who shaped
              the realm. Discover their stories, season by season.
            </p>
            <Link className="atlas-text-link" to="/">
              Step inside the realm map <ArrowRightIcon aria-hidden="true" />
            </Link>
          </div>
          <div className="catalog-featured">
            <p className="eyebrow">A few familiar faces</p>
            <div className="catalog-featured-portraits">
              {FEATURED_CHARACTERS.map((character) => (
                <Link
                  key={character.slug}
                  to={`/journeys/game-of-thrones/${character.slug}`}
                  className="catalog-featured-character"
                  aria-label={`Explore ${character.name}'s journey`}
                >
                  <img
                    src={
                      blobAssets.characters[`game-of-thrones/${character.slug}`].url
                    }
                    width="200"
                    height="240"
                    alt=""
                    decoding="async"
                  />
                  <span>
                    {character.name} <ArrowRightIcon aria-hidden="true" />
                  </span>
                  <small>{character.house}</small>
                </Link>
              ))}
            </div>
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

          <label className="ready-filter">
            <input
              type="checkbox"
              checked={readyOnly}
              onChange={(event) => {
                setReadyOnly(event.target.checked);
                updateFilter("status", event.target.checked ? "published" : null);
              }}
            />
            Ready journeys only
          </label>

          <div
            className="series-tabs"
            role="group"
            aria-label="Filter by television series"
          >
            {SERIES.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={series === item.id ? "is-active" : ""}
                aria-pressed={series === item.id}
                onClick={() =>
                  updateFilter("series", item.id === "all" ? null : item.id)
                }
              >
                <span className="series-tab-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-result-heading" aria-live="polite">
          <div className="catalog-result-copy">
            <h2>
              {search ? (
                <>Results for <strong>“{search}”</strong></>
              ) : series === "all" ? (
                "The character index"
              ) : (
                SERIES.find((item) => item.id === series).label
              )}
              <span
                className="catalog-result-count"
                aria-label={`${total} matching characters`}
              >
                {loading ? "…" : total}
              </span>
            </h2>
            <p>
              {loading
                ? "Opening the catalogue…"
                : `${published} journeys to explore${deferred ? ` · ${deferred} routes in progress` : ""}`}
            </p>
          </div>
          {hasFilters ? (
            <button className="catalog-reset" type="button" onClick={clearFilters}>
              <XIcon aria-hidden="true" /> Clear filters
            </button>
          ) : (
            <span className="catalog-browse-hint">
              Choose a character. Follow their story.
            </span>
          )}
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
            <div className="catalog-pagination">
              <p>
                Showing <strong>{characters.length}</strong> of{" "}
                <strong>{total}</strong> characters
              </p>
              <progress
                value={characters.length}
                max={total}
                aria-label="Characters shown"
              />
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
            </div>
          </>
        ) : (
          <div className="catalog-empty">
            <span aria-hidden="true">∅</span>
            <h2>No matching character was found.</h2>
            <p>Try a shorter name, another title, or a different series.</p>
            <Button type="button" variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
