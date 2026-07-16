import { useEffect } from "react";
import { ArrowLeftIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "../ui/button.jsx";
import { useSiteTheme } from "../../hooks/useSiteTheme.js";
import { BrandMark } from "../brand/BrandMark.jsx";

export function NotFoundPage() {
  const { theme } = useSiteTheme();

  useEffect(() => {
    document.title = "Page Not Found | Map of Ice and Fire";
  }, []);

  return (
    <main className={`not-found-page site-theme site-theme-${theme}`} data-theme={theme}>
      <section className="not-found-card" aria-labelledby="not-found-title">
        <BrandMark className="not-found-mark" />
        <p className="eyebrow">No journey is charted here</p>
        <strong className="not-found-code" aria-hidden="true">404</strong>
        <h1 id="not-found-title">This page has been lost to history.</h1>
        <p className="not-found-copy">
          The path you followed does not cross the known world. Return to the realm map or
          choose another character journey.
        </p>
        <nav className="not-found-actions" aria-label="Page not found navigation">
          <Link to="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
            Realm Map
          </Link>
          <Link to="/home" className={buttonVariants({ size: "lg" })}>
            <UsersIcon data-icon="inline-start" aria-hidden="true" />
            Explore Characters
          </Link>
        </nav>
      </section>
    </main>
  );
}
