#!/usr/bin/env node

// Compatibility entry point. The audited TV-only curation pipeline now owns
// duplicate handling so fuzzy name matching can never merge unrelated people.
await import("./curate-tv-datasets.mjs")
