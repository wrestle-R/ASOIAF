import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./components/home/HomePage.jsx";
import { CharacterJourneyPage } from "./components/journey/CharacterJourneyPage.jsx";
import { NotFoundPage } from "./components/not-found/NotFoundPage.jsx";
import { RealmTourPage } from "./components/realms/RealmTourPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RealmTourPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route
        path="/journeys/:seriesSlug/:characterSlug"
        element={<CharacterJourneyPage />}
      />
      <Route path="/wiki" element={<Navigate replace to="/home" />} />
      <Route
        path="/danerys"
        element={<Navigate replace to="/journeys/game-of-thrones/daenerys-targaryen" />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
