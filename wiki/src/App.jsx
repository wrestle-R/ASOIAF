import { Navigate, Route, Routes } from "react-router-dom";
import { IntroPage } from "./components/intro/IntroPage.jsx";
import { WikiPage } from "./components/wiki/WikiPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/wiki" element={<WikiPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
