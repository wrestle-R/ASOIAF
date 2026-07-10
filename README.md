# ASOIAF Archive

The complete private dataset is available in JSON, portable SQL, and SQLite formats under `datasets/`. The minimal wiki application lives under `wiki/` and queries the SQLite database directly with `sql.js`.

## Dataset totals

- 2,146 characters
- 29 dragons
- 408 canonical houses
- 2,784 source citations
- 4,480 recorded relationships

## Build the SQL archive

```bash
node scripts/build-sql.mjs
```

## Run the wiki

```bash
cd wiki
npm install
npm run dev
```

## Publish the prepared release manually

Repository policy prevents automated Git and GitHub writes. Run this yourself when ready:

```bash
gh release create v1.0.0 \
  datasets/asiof.sqlite \
  datasets/asiof.sql \
  datasets/asiof-dataset-v1.0.0.tar.gz \
  datasets/SHA256SUMS \
  --title "ASOIAF Dataset v1.0.0" \
  --notes "Deduplicated SQLite and SQL dataset: 2,146 characters, 29 dragons, and 408 canonical houses."
```
