import { forwardRef } from "react";
import { SigilIcon } from "./SigilIcon.jsx";

export const HouseMarker = forwardRef(function HouseMarker(
  { house, selected, muted, onSelect },
  ref,
) {
  const { desktop, mobile } = house.position;

  return (
    <button
      ref={ref}
      type="button"
      className={`house-marker marker-label-${desktop.labelOffset} marker-label-mobile-${mobile.labelOffset} ${selected ? "is-selected" : ""} ${muted ? "is-muted" : ""}`}
      style={{
        "--marker-x": `${desktop.x}%`,
        "--marker-y": `${desktop.y}%`,
        "--marker-x-mobile": `${mobile.x}%`,
        "--marker-y-mobile": `${mobile.y}%`,
        "--marker-scale": desktop.markerScale,
        "--marker-scale-mobile": mobile.markerScale,
      }}
      aria-label={`${house.name}${house.region ? `, ${house.region}` : ""}`}
      aria-pressed={selected}
      onClick={(event) => onSelect(house, event.currentTarget)}
    >
      <SigilIcon house={house} />
      <span className="marker-label">
        <span>{house.name.replace(/^House\s+/i, "")}</span>
        <small>{desktop.seat || house.seat}</small>
      </span>
    </button>
  );
});
