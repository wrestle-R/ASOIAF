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

export function SiteHeader({ theme, toggleTheme, section }) {
  return (
    <header className="site-header">
      <NavLink
        to="/home"
        className="site-brand"
        aria-label="A Map of Ice and Fire home"
      >
        <BrandMark />
        <strong>A Map of Ice and Fire</strong>
      </NavLink>
      <nav aria-label="Primary navigation">
        {section !== "characters" && (
          <NavLink to="/home" aria-label="Characters">
            <UsersIcon aria-hidden="true" />
            <span>Characters</span>
          </NavLink>
        )}
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
