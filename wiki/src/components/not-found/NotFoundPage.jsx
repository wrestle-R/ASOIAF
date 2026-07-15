import { ArrowLeftIcon, BookOpenIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "../ui/button.jsx";
import { useWikiTheme } from "../../hooks/useWikiTheme.js";

export function NotFoundPage() {
  const { theme } = useWikiTheme();

  return (
    <main className={`not-found-page wiki-theme wiki-theme-${theme}`} data-theme={theme}>
      <section className="not-found-card" aria-labelledby="not-found-title">
        <div className="not-found-mark" aria-hidden="true">W</div>
        <p className="eyebrow">The archive has no record</p>
        <strong className="not-found-code" aria-hidden="true">404</strong>
        <h1 id="not-found-title">This page has been lost to history.</h1>
        <p className="not-found-copy">
          The path you followed does not appear in the known record. Return to the map or
          continue your search in the archive.
        </p>
        <nav className="not-found-actions" aria-label="Page not found navigation">
          <Link to="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
            Return to the Map
          </Link>
          <Link to="/wiki" className={buttonVariants({ size: "lg" })}>
            <BookOpenIcon data-icon="inline-start" aria-hidden="true" />
            Explore the Wiki
          </Link>
        </nav>
      </section>
    </main>
  );
}
