import { BookOpenIcon, MapIcon, UsersIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { BrandMark } from "./BrandMark.jsx";
import { cn } from "../../lib/utils.js";

export function CinematicHeader({ children }) {
  return (
    <header className={cn("cinematic-header", children && "has-back-link")}>
      {children || (
        <NavLink className="cinematic-brand" to="/home" aria-label="A Map of Ice and Fire home">
          <BrandMark />
          <span><strong>A Map of Ice and Fire</strong><small>An atlas of the known world</small></span>
        </NavLink>
      )}
      {children && <span className="cinematic-emblem" aria-hidden="true"><BrandMark /><span>A Map of Ice and Fire</span></span>}
      <nav aria-label="Primary navigation">
        <NavLink to="/" end aria-label="Realm map"><MapIcon aria-hidden="true" /><span>Realm map</span></NavLink>
        {!children && <NavLink to="/home" aria-label="Characters"><UsersIcon aria-hidden="true" /><span>Characters</span></NavLink>}
        <NavLink to="/docs" aria-label="The archives"><BookOpenIcon aria-hidden="true" /><span>The archives</span></NavLink>
      </nav>
    </header>
  );
}
