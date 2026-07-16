async function readJson(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Character request failed");
  }

  return payload;
}

export async function fetchCharacters(options = {}, signal) {
  const parameters = new URLSearchParams();
  if (options.search) parameters.set("search", options.search);
  if (options.series && options.series !== "all") {
    parameters.set("series", options.series);
  }
  parameters.set("limit", String(options.limit ?? 30));
  parameters.set("offset", String(options.offset ?? 0));

  const response = await fetch(`/api/characters?${parameters}`, { signal });
  return readJson(response);
}

export async function fetchCharacter(seriesSlug, characterSlug, signal) {
  const response = await fetch(
    `/api/characters/${encodeURIComponent(seriesSlug)}/${encodeURIComponent(characterSlug)}`,
    { signal },
  );
  return readJson(response);
}
