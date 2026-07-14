import { useEffect, useState } from "react";
import { fetchIntroHouses } from "../../data/houseApi.js";
import { MapLanding } from "./MapLanding.jsx";

export function IntroPage() {
  const [houses, setHouses] = useState([]);
  const [error, setError] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    fetchIntroHouses(controller.signal)
      .then((payload) => setHouses(payload.houses ?? []))
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      });
    return () => controller.abort();
  }, [requestVersion]);

  return (
    <MapLanding
      houses={houses}
      loading={!error && houses.length === 0}
      error={error}
      onRetry={() => setRequestVersion((version) => version + 1)}
      partial={houses.length > 0 && houses.length !== 9}
    />
  );
}
