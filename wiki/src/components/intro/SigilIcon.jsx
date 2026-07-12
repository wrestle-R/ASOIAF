function Motif({ type }) {
  switch (type) {
    case "wolf":
      return <path d="M12 5 8.5 8 5 7l1.8 4.2L6 16l4 3 4-1 3.5-5.5L19 8l-4 1-3-4Z" />;
    case "lion":
      return <path d="M8 7.2 5.5 9 7 12l-1 3 3 4 4-1 3-3-1-3 2-3-3-2-1.8-2L10 7 8 7.2Zm3.8 3.1 2.1 1.4-1.1 3-2.8-.8-.4-2.6 2.2-1Z" />;
    case "stag":
      return <path d="M11 20v-7L8 9 5 7V4m8 9 3-4 3-2V4M8 9 5 11 3 9m13 0 3 2 2-2M9 16h6l-1.5 4h-3L9 16Z" />;
    case "dragon":
      return <path d="M5 18c3-1 4-4 3-7l3 1-1-5 4 3 4-2-1 5 3 2-5 1-2 4-3-3-5 1Z" />;
    case "kraken":
      return <path d="M8 10a4 4 0 1 1 8 0v2c0 4 3 4 3 7-3 0-4-2-4-4 0 3-1 5-3 6-2-1-3-3-3-6 0 2-1 4-4 4 0-3 3-3 3-7v-2Z" />;
    case "rose":
      return <path d="M12 5c2-2 5 0 4 2 3-1 4 3 2 4 2 2 0 5-2 4 1 3-3 4-4 2-2 2-5 1-4-2-3 0-5-3-3-4-2-2 1-5 3-4-1-3 2-5 4-3Z" />;
    case "sun":
      return <path d="M12 3l1.4 4.2L17 5l-.6 4.3L21 9l-3.4 3 3.4 3-4.6-.3L17 19l-3.6-2.2L12 21l-1.4-4.2L7 19l.6-4.3L3 15l3.4-3L3 9l4.6.3L7 5l3.6 2.2L12 3Z" />;
    case "trout":
      return <path d="M3 12c4-5 10-5 14-1l4-3-1 4 1 4-4-3c-4 4-10 4-14-1Zm6-1h.1" />;
    case "falcon":
      return <path d="M4 8c4 0 6 2 8 5 2-3 4-5 8-5-1 4-4 7-7 8l-1 4-1-4C8 15 5 12 4 8Z" />;
    default:
      return null;
  }
}

function motifFromText(text = "") {
  const value = (text ?? "").toLowerCase();
  if (value.includes("direwolf") || value.includes("wolf")) return "wolf";
  if (value.includes("lion")) return "lion";
  if (value.includes("stag")) return "stag";
  if (value.includes("dragon")) return "dragon";
  if (value.includes("kraken")) return "kraken";
  if (value.includes("rose")) return "rose";
  if (value.includes("sun")) return "sun";
  if (value.includes("trout")) return "trout";
  if (value.includes("falcon")) return "falcon";
  return null;
}

export function SigilIcon({ house, size = 38, className = "" }) {
  const motif = motifFromText(house.coatOfArms);
  const initial = house.name?.replace(/^House\s+/i, "").charAt(0) || "?";
  const color = house.color || "#8b7650";

  return (
    <span
      className={`sigil ${className}`}
      style={{ "--sigil-color": color, width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" role="presentation">
        {motif ? (
          <g fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round">
            <Motif type={motif} />
          </g>
        ) : (
          <text x="12" y="16" textAnchor="middle" fontSize="11">
            {initial}
          </text>
        )}
      </svg>
    </span>
  );
}
