export const DOC_GROUPS = ["Explore the atlas", "Build & contribute"];

export const DOC_ARTICLES = [
  {
    slug: "getting-started",
    label: "Getting started",
    group: DOC_GROUPS[0],
    title: "A guide to the known world.",
    description:
      "An atlas of character journeys, grounded in what appears on screen.",
    sections: [
      {
        id: "first-journey",
        title: "Choose your first journey",
        paragraphs: [
          "Start with a character you know, or follow someone whose story you have yet to explore. The catalogue brings together Game of Thrones, House of the Dragon, and A Knight of the Seven Kingdoms.",
        ],
        steps: [
          {
            title: "Find a character",
            text: "Search by name, title, house, or alias. Choose a series to narrow the index.",
          },
          {
            title: "Open a ready journey",
            text: "Use Ready journeys only to show published routes. A pending route opens a coverage explanation rather than an invented path.",
          },
          {
            title: "Follow their seasons",
            text: "Play the route, pause to look around, or choose a season. At the end, explore the complete journey.",
          },
        ],
        link: { to: "/home", label: "Choose a character" },
      },
      {
        id: "read-the-map",
        title: "Read the map",
        paragraphs: [
          "A route connects a character's recorded stops. Its line is a visual connection between locations, not a claim about the exact road taken. Use the journey controls to pause, zoom, and return to the overview.",
        ],
        diagram: true,
      },
      {
        id: "realm-tour",
        title: "Explore the realms",
        paragraphs: [
          "The realm map introduces nine regions of Westeros. It plays after the map artwork loads. Pause the tour, move between regions, or continue into the character catalogue.",
        ],
        link: { to: "/", label: "Enter the realm map" },
      },
      {
        id: "spoilers",
        title: "A note on spoilers",
        paragraphs: [
          "Journeys include later seasons and can reveal character destinations and the end of a story. There is currently no episode-based spoiler filter. Check a journey's coverage before exploring it.",
        ],
      },
    ],
  },
  {
    slug: "reading-a-journey",
    label: "Reading a journey",
    group: DOC_GROUPS[0],
    title: "Follow a story across the map.",
    description:
      "The controls, seasons, and route details that make up a character's journey.",
    sections: [
      {
        id: "playback",
        title: "Playback and seasons",
        paragraphs: [
          "A published journey draws its route season by season. Pause and resume with the playback button. Choose a season from the season controls to restart there. Replay begins the story again.",
        ],
      },
      {
        id: "overview",
        title: "The complete journey",
        paragraphs: [
          "The complete journey brings the character's route together. Zoom in for a closer look, pan around the map, and reset the view when you want to see the whole route again. Mobile camera framing keeps the current stop within view during playback.",
        ],
      },
      {
        id: "keyboard",
        title: "Keyboard controls",
        items: [
          "Space pauses or resumes playback.",
          "Left and right arrows move between seasons during journey playback, or between regions in the realm tour.",
          "Escape returns to the character catalogue.",
          "Tab moves through links and controls; Enter activates the focused link or button.",
        ],
        paragraphs: [
          "In the complete journey overview, focus the map and use the arrow keys or W, A, S, and D to pan, plus and minus to zoom, and zero to reset. Outside the focused map, the left arrow returns to season playback. With reduced motion enabled, use the season controls instead of autoplay.",
        ],
      },
      {
        id: "route-meaning",
        title: "What the route tells you",
        paragraphs: [
          "Recorded locations anchor the journey. Connections help you read their order across the map; they do not establish every intermediate town, road, or sea crossing. A character absent from a season is not assigned a new location just to fill the gap.",
        ],
        link: {
          to: "/docs/coverage-and-sources",
          label: "Read about coverage and sources",
        },
      },
    ],
  },
  {
    slug: "coverage-and-sources",
    label: "Coverage & sources",
    group: DOC_GROUPS[0],
    title: "A route should earn its place.",
    description:
      "How to read coverage, uncertainty, and journeys that are still awaiting review.",
    sections: [
      {
        id: "status",
        title: "Ready, deferred, and pending",
        paragraphs: [
          "Ready journeys have published route data. Deferred and pending characters remain discoverable in the catalogue, but their pages explain why a television-canon route is not available. Availability is separate from whether a television series has finished.",
        ],
      },
      {
        id: "coverage",
        title: "Read the coverage boundary",
        paragraphs: [
          "Published character metadata records the episode through which the journey is verified. Completion can mean the series ended, the character's story ended, or the available season coverage ended. An ongoing series should not be presented as a finished story.",
        ],
      },
      {
        id: "evidence",
        title: "Depiction and inference",
        paragraphs: [
          "The journey dataset distinguishes depicted appearances from other recorded location context. An inferred connection must not become an extra on-screen appearance. Unknown geography stays unknown; an attractive map line does not resolve missing evidence.",
        ],
      },
      {
        id: "corrections",
        title: "Suggest a correction",
        paragraphs: [
          "Include the series, character, season, episode, and location. Explain what the scene establishes, and separate the departure, arrival, and travel between them. This makes a correction easier to verify.",
        ],
        externalLink: {
          href: "https://github.com/wrestle-R/ASOIAF/issues",
          label: "Open the project issue tracker",
        },
      },
    ],
  },
  {
    slug: "local-development",
    label: "Local development",
    group: DOC_GROUPS[1],
    title: "Open your own map room.",
    description:
      "Run the React app and its read-only character service on your machine.",
    sections: [
      {
        id: "setup",
        title: "Get the project running",
        paragraphs: [
          "Clone the repository and run these commands from its root. Use a Node version compatible with the installed Vite and better-sqlite3 packages; Node 22.12 or newer satisfies the current Vite 7 requirement.",
        ],
        code: "cd wiki\nnpm install\nnpm run dev",
        codeLabel: "Development server",
        items: [
          "Open http://127.0.0.1:5173 in your browser.",
          "Vite proxies /api requests to the character service on port 4174.",
          "The development command starts both processes together.",
        ],
      },
      {
        id: "database",
        title: "Prepare the character database",
        paragraphs: [
          "The browser never receives the source SQLite dataset. The API opens a metadata database read-only. Preparation can derive it from a local source dataset or download the published artifact and verify its size and SHA-256.",
        ],
        code: "npm run prepare:db",
        codeLabel: "Prepare verified metadata",
      },
      {
        id: "checks",
        title: "Check your changes",
        paragraphs: [
          "Run the unit tests and production build before sharing a change. With the development server running, browser verification scripts exercise the catalogue, realm tour, and character journeys.",
        ],
        code: "npm run check\nnpm run verify:catalog\nnpm run verify:docs\nnpm run verify:map\nnpm run verify:journeys",
        codeLabel: "Verification commands",
      },
      {
        id: "structure",
        title: "Find your way through the code",
        items: [
          "src/components contains the catalogue, map, journeys, and docs interfaces.",
          "src/data/journeys contains the published journey catalogue and character routes.",
          "src/data/docs.js contains these archive articles and their search content.",
          "server contains the character API and SQLite queries.",
          "scripts contains database preparation, asset syncing, and browser checks.",
        ],
        externalLink: {
          href: "https://github.com/wrestle-R/ASOIAF",
          label: "Browse the source code",
        },
      },
    ],
  },
  {
    slug: "deployment",
    label: "Deployment",
    group: DOC_GROUPS[1],
    title: "Bring the atlas to the web.",
    description:
      "Build locally or deploy the existing Vite and Node setup to Vercel.",
    sections: [
      {
        id: "production",
        title: "Try a production build",
        paragraphs: [
          "Run from wiki/. The build prepares the verified metadata database before compiling the frontend. Start the character API in one terminal, then run the Vite preview in another terminal to inspect the built site. npm start serves the API; it does not serve the frontend.",
        ],
        code: "npm run build\n# Terminal 1: start the character API\nnpm start\n# Terminal 2: preview the built frontend\nnpm run preview",
        codeLabel: "Local production build",
      },
      {
        id: "vercel",
        title: "Deploy to Vercel",
        steps: [
          {
            title: "Import the repository",
            text: "Connect wrestle-R/ASOIAF and set the project root directory to wiki.",
          },
          {
            title: "Use the Vite configuration",
            text: "The tracked vercel.json sets the build command, output directory, API function, and route rewrites.",
          },
          {
            title: "Build and verify",
            text: "The build downloads and verifies the metadata database. Check the catalogue API, a direct journey URL, and a direct /docs URL after deployment.",
          },
        ],
      },
      {
        id: "assets",
        title: "Keep media separate",
        paragraphs: [
          "Portraits, maps, and sigils load directly from immutable Vercel Blob objects referenced in the asset manifest. The API function includes the metadata database, never the original image dataset. The Blob write token is needed to upload new assets, not to read published media.",
        ],
      },
      {
        id: "caching",
        title: "Understand catalogue caching",
        paragraphs: [
          "Successful public character responses can be cached in the browser for 60 seconds and at the shared cache for 5 minutes, with a further stale-while-revalidate window. A read-only database connection also reuses its processed catalogue. Replace the database connection when loading a different dataset.",
        ],
      },
    ],
  },
  {
    slug: "contributing",
    label: "Contributing",
    group: DOC_GROUPS[1],
    title: "Add another thread to the story.",
    description:
      "Help improve the atlas while keeping its geography and evidence dependable.",
    sections: [
      {
        id: "journeys",
        title: "Work on a character journey",
        paragraphs: [
          "Journey modules live under src/data/journeys/characters, grouped by series. Check the catalogue status and existing place anchors before editing a route. Record coverage and avoid inventing travel to make the animation more dramatic.",
        ],
      },
      {
        id: "geography",
        title: "Protect the geography",
        paragraphs: [
          "The world map has a fixed intrinsic aspect ratio. Camera framing can change what is visible, but must not stretch the map or move locations to fit a composition. Check desktop, portrait phone, and landscape phone views after changing coordinates or camera behavior.",
        ],
      },
      {
        id: "media",
        title: "Update artwork deliberately",
        paragraphs: [
          "The asset sync script uploads content-addressed media and updates the manifest. Configure BLOB_READ_WRITE_TOKEN in your ignored local environment only when you intend to publish assets. Database rebuilding reconnects the public metadata to those assets.",
        ],
        code: "npm run sync:blob\nnpm run build:web-db\nnpm run prepare:db",
        codeLabel: "Publish reviewed media updates",
      },
      {
        id: "review",
        title: "Make the change easy to review",
        items: [
          "Explain the visible behavior that changes and the reason for it.",
          "Attach episode evidence when a journey's locations or coverage change.",
          "Run the checks relevant to the change, including mobile map verification for camera work.",
          "Keep generated datasets, environment files, and credentials out of commits.",
        ],
        externalLink: {
          href: "https://github.com/wrestle-R/ASOIAF/issues",
          label: "Find or suggest an improvement",
        },
      },
    ],
  },
];

export function searchArticles(query) {
  const terms = query
    .trim()
    .toLocaleLowerCase("en")
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return DOC_ARTICLES;
  return DOC_ARTICLES.filter((article) => {
    const text = [
      article.label,
      article.title,
      article.description,
      ...article.sections.flatMap((section) => [
        section.title,
        ...(section.paragraphs || []),
        ...(section.items || []),
        section.code || "",
        ...(section.steps || []).flatMap((step) => [step.title, step.text]),
      ]),
    ]
      .join(" ")
      .toLocaleLowerCase("en");
    return terms.every((term) => text.includes(term));
  });
}
