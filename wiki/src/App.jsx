import { Route, Routes } from "react-router-dom";
import { DaenerysJourneyPage } from "./components/journey/DaenerysJourneyPage.jsx";
import { NotFoundPage } from "./components/not-found/NotFoundPage.jsx";
import { RealmTourPage } from "./components/realms/RealmTourPage.jsx";
import { WikiPage } from "./components/wiki/WikiPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RealmTourPage />} />
      <Route path="/danerys" element={<DaenerysJourneyPage />} />
      <Route path="/wiki" element={<WikiPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
