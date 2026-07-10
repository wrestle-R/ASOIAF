# ASOIAF Wiki

A minimal read-only wiki backed directly by the generated SQLite archive.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. By default the app loads `/asiof.sqlite`, which is linked to `../datasets/asiof.sqlite`.

To load the database from a GitHub Release instead, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_DATABASE_URL` to the direct release-asset URL.

## Verify

```bash
npm run typecheck
npm run build
```

## Rebuild the database

From the repository root:

```bash
node scripts/build-sql.mjs
```

This regenerates both `datasets/asiof.sql` and `datasets/asiof.sqlite` from the three JSON datasets.
