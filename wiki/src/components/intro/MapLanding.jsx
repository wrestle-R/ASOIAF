import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenIcon, CircleAlertIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withMapPosition } from "../../data/mapPositions.js";
import { HouseDetailPanel } from "./HouseDetailPanel.jsx";
import { HouseMarker } from "./HouseMarker.jsx";

export function MapLanding({ houses, loading, error, onRetry, partial }) {
  const positionedHouses = useMemo(() => withMapPosition(houses), [houses]);
  const [selected, setSelected] = useState(null);
  const [opener, setOpener] = useState(null);
  const [phoneLayout, setPhoneLayout] = useState(() => window.matchMedia("(max-width: 880px)").matches);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 880px)");
    const updateLayout = (event) => setPhoneLayout(event.matches);
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  const handleSelect = useCallback((house, button) => {
    setSelected(house);
    setOpener(button);
  }, []);

  const closePanel = useCallback(() => setSelected(null), []);

  return (
    <main className="map-page">
      <header className="map-header">
        <Link to="/" className="brand-lockup" aria-label="Wiki of Ice and Fire home">
          <span className="brand-mark">W</span>
          <span>
            <strong>Wiki of Ice and Fire</strong>
            <small>Westeros atlas</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <span className="map-hint">Select a sigil</span>
          <Link
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "archive-button")}
            to="/wiki"
          >
            <BookOpenIcon data-icon="inline-start" />
            Archive
          </Link>
        </nav>
      </header>

      {loading && <span className="sr-only" role="status">Loading house sigils</span>}

      {error && (
        <Alert className="map-alert" variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>House records are unavailable</AlertTitle>
          <AlertDescription>The map is ready, but its sigils could not be loaded.</AlertDescription>
          <AlertAction>
            <Button type="button" size="xs" variant="outline" onClick={onRetry}>Retry</Button>
          </AlertAction>
        </Alert>
      )}

      {partial && (
        <p className="partial-notice" role="status">
          {houses.length} of 9 house records are available.
        </p>
      )}

      <section className="map-shell" aria-label="Map of the great houses">
        <div className="map-viewport">
          <div className="map-stage">
            <picture className="world-map-picture">
              <source media="(max-width: 880px)" srcSet="/assets/world-map-realms-mobile-capitals.webp" />
              <img
                className="world-map"
                src="/assets/world-map-houses.webp"
                alt="An illustrated political map of the nine realms of Westeros"
                width="1484"
                height="1060"
                draggable="false"
              />
            </picture>
            <div className="map-toning" aria-hidden="true" />
            <div className="marker-layer">
              {positionedHouses.map((house) => (
                <HouseMarker
                  key={house.id}
                  house={house}
                  selected={selected?.id === house.id}
                  muted={Boolean(selected && selected.id !== house.id)}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        </div>
        {selected && (
          <HouseDetailPanel
            house={selected}
            opener={opener}
            onClose={closePanel}
            side={phoneLayout ? "bottom" : "right"}
          />
        )}
      </section>
    </main>
  );
}
