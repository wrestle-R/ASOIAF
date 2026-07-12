import { forwardRef } from "react";
import { SigilIcon } from "./SigilIcon.jsx";

export const HouseMarker = forwardRef(function HouseMarker(
  { house, selected, muted, onSelect, introActive },
  ref,
) {
  const { x, y, labelOffset, order } = house.position;

  return (
    <button
      ref={ref}
      type="button"
      className={`house-marker marker-label-${labelOffset} ${selected ? "is-selected" : ""} ${muted ? "is-muted" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        "--marker-color": house.color || "#bda66f",
        "--marker-delay": `${introActive ? 4.5 + order * 0.18 : 0}s`,
      }}
      aria-label={`${house.name}${house.region ? `, ${house.region}` : ""}`}
      aria-pressed={selected}
      onClick={(event) => onSelect(house, event.currentTarget)}
    >
      <span className="marker-pulse" />
      <SigilIcon house={house} />
      <span className="marker-label">
        <span>{house.name.replace(/^House\s+/i, "")}</span>
        {house.seat && <small>{house.seat}</small>}
      </span>
    </button>
  );
});
