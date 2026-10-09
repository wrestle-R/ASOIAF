# A Map of Ice and Fire — interface direction

The catalogue and docs use an editorial atlas treatment: Newsreader headings,
Geist body text, warm paper in light mode, charcoal in dark mode, restrained brass
accents, fine rules, and generous reading space. Existing maps, portraits, and the
brand mark remain the source assets.

Two standalone references were generated with the built-in image generation tool:
`catalogue-reference.png` and `docs-reference.png` (local generated artifacts).
The references informed layout and typography; their sample branding and copy are
superseded by the actual product name and the implemented guides.

Catalogue prompt: a horizontal catalogue upper section with a spacious serif
masthead, a faint antique map backdrop, ruled search and series filters, and
image-led character columns with names and metadata beneath the portraits.

Docs prompt: a horizontal editorial reading interface with grouped archive
navigation, search, a comfortable article column, a right-hand section outline,
numbered instructions, and previous/next article links in the same palette.

The implemented docs diagram is intentionally schematic. It does not introduce
new character locations or claim an exact travel route.

The site-wide refresh extends this direction with arched featured portraits,
roomier series navigation, aligned character-card metadata, numbered archive
guides, and a shared cinematic masthead with previous/next map controls. Mobile
catalogues retain two columns and show all four series choices in a compact grid.

The new brand mark is a native SVG compass combining a frost branch and a flame,
drawn in parchment and brass on charcoal. `wiki/public/brand-mark.svg` is its source;
`npm run build:brand` in `wiki` exports the matching PNG icons and social card.
It is a vector asset, independent of the generated interface references above.
