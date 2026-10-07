import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const HomePage = lazy(() =>
  import("./components/home/HomePage.jsx").then((module) => ({
    default: module.HomePage,
  })),
);
const CharacterJourneyPage = lazy(() =>
  import("./components/journey/CharacterJourneyPage.jsx").then((module) => ({
    default: module.CharacterJourneyPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./components/not-found/NotFoundPage.jsx").then((module) => ({
    default: module.NotFoundPage,
  })),
);
const RealmTourPage = lazy(() =>
  import("./components/realms/RealmTourPage.jsx").then((module) => ({
    default: module.RealmTourPage,
  })),
);
const DocsPage = lazy(() =>
  import("./components/docs/DocsPage.jsx").then((module) => ({
    default: module.DocsPage,
  })),
);

export default function App() {
  return (
    <Suspense
      fallback={
        <main className="page-loading" role="status">
          <img src="/brand-mark.svg" width="48" height="48" alt="" />
          <p>Opening A Map of Ice and Fire…</p>
        </main>
      }
    >
      <Routes>
        <Route path="/" element={<RealmTourPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/docs/:articleSlug" element={<DocsPage />} />
        <Route
          path="/journeys/:seriesSlug/:characterSlug"
          element={<CharacterJourneyPage />}
        />
        <Route path="/wiki" element={<Navigate replace to="/home" />} />
        <Route
          path="/danerys"
          element={
            <Navigate
              replace
              to="/journeys/game-of-thrones/daenerys-targaryen"
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
