async function readJson(response) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || payload.error || "Archive request failed");
  }
  return response.json();
}

export async function fetchIntroHouses(signal) {
  const response = await fetch("/api/intro/houses", { signal });
  return readJson(response);
}

export async function fetchCollections(signal) {
  const response = await fetch("/api/wiki/collections", { signal });
  return readJson(response);
}

export async function fetchWikiEntries(options = {}, signal) {
  const parameters = new URLSearchParams();
  if (options.search) parameters.set("search", options.search);
  if (options.collection && options.collection !== "all") {
    parameters.set("collection", options.collection);
  }
  parameters.set("limit", String(options.limit ?? 18));
  parameters.set("offset", String(options.offset ?? 0));

  const response = await fetch(`/api/wiki/entries?${parameters}`, { signal });
  return readJson(response);
}
