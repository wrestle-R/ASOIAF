import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./components/landing/LandingPage.jsx";
import { DaenerysJourneyPage } from "./components/journey/DaenerysJourneyPage.jsx";
import { RealmTourPage } from "./components/realms/RealmTourPage.jsx";
import { WikiPage } from "./components/wiki/WikiPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/map" element={<RealmTourPage />} />
      <Route path="/danerys" element={<DaenerysJourneyPage />} />
      <Route path="/wiki" element={<WikiPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
