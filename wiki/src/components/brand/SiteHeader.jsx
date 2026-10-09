import {
  BookOpenIcon,
  MapIcon,
  MoonIcon,
  SunIcon,
  UsersIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button.jsx";
import { BrandMark } from "./BrandMark.jsx";

export function SiteHeader({ theme, toggleTheme }) {
  return (
    <header className="site-header">
      <NavLink
        to="/home"
        className="site-brand"
        aria-label="A Map of Ice and Fire home"
      >
        <BrandMark />
        <span className="site-wordmark">
          <strong>A Map of Ice and Fire</strong>
          <small>An atlas of the known world</small>
        </span>
      </NavLink>
      <nav aria-label="Primary navigation">
        <NavLink to="/home" aria-label="Characters">
          <UsersIcon aria-hidden="true" />
          <span>Characters</span>
        </NavLink>
        <NavLink to="/" end aria-label="Realm map">
          <MapIcon aria-hidden="true" />
          <span>Realm map</span>
        </NavLink>
        <NavLink to="/docs" aria-label="The archives">
          <BookOpenIcon aria-hidden="true" />
          <span>The archives</span>
        </NavLink>
        <Button
          type="button"
          variant="ghost"
          className="site-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? (
            <SunIcon data-icon="inline-start" aria-hidden="true" />
          ) : (
            <MoonIcon data-icon="inline-start" aria-hidden="true" />
          )}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </Button>
      </nav>
    </header>
  );
}
