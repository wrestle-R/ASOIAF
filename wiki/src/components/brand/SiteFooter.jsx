import { Link } from "react-router-dom";
import { BrandMark } from "./BrandMark.jsx";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="footer-brand" to="/home"><BrandMark /><span>A Map of Ice and Fire</span></Link>
      <p>The people. The places. The paths between.</p>
      <Link to="/docs">A guide to the known world ↗</Link>
    </footer>
  );
}
