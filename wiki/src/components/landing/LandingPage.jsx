import { ArrowRightIcon, BookOpenIcon, MapIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <main className="landing-page">
      <img
        className="landing-map"
        src="/assets/world-map.webp"
        alt=""
        width="1484"
        height="1060"
        fetchPriority="high"
        draggable="false"
      />
      <div className="landing-shade" aria-hidden="true" />
      <section className="landing-content" aria-labelledby="landing-title">
        <span className="landing-mark" aria-hidden="true">W</span>
        <h1 id="landing-title">A Wiki of Ice and Fire</h1>
        <nav className="landing-actions" aria-label="Choose a destination">
          <Link to="/wiki" className="landing-action landing-action-primary">
            <BookOpenIcon aria-hidden="true" />
            Enter the Wiki
            <ArrowRightIcon aria-hidden="true" />
          </Link>
          <Link to="/map" className="landing-action">
            <MapIcon aria-hidden="true" />
            View the Map
          </Link>
        </nav>
      </section>
    </main>
  );
}
