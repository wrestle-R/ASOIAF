import { forwardRef } from "react";
import { INTRO_HOUSE_ORDER } from "../../data/mapPositions.js";
import { SigilIcon } from "./SigilIcon.jsx";

export const HouseMarker = forwardRef(function HouseMarker(
  { house, selected, muted, onSelect, introActive },
  ref,
) {
  const { x, y, labelOffset, seat, markerScale } = house.position;
  const revealIndex = Math.max(0, INTRO_HOUSE_ORDER.indexOf(house.id));

  return (
    <button
      ref={ref}
      type="button"
      className={`house-marker marker-label-${labelOffset} ${selected ? "is-selected" : ""} ${muted ? "is-muted" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        "--marker-color": house.color || "#bda66f",
        "--marker-delay": `${introActive ? 1.25 + revealIndex * 1.05 : 0}s`,
        "--marker-scale": markerScale,
      }}
      aria-label={`${house.name}${house.region ? `, ${house.region}` : ""}`}
      aria-pressed={selected}
      onClick={(event) => onSelect(house, event.currentTarget)}
    >
      <span className="marker-pulse" />
      <SigilIcon house={house} />
      <span className="marker-label">
        <span>{house.name.replace(/^House\s+/i, "")}</span>
        <small>{house.region || seat || house.seat}</small>
        {house.words && <em>{house.words}</em>}
      </span>
    </button>
  );
});
