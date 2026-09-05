import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "jon-roxton",
  "characterName": "Jon Roxton",
  "totalSeasons": 3,
  "coverage": {
    "throughEpisode": "S3E8",
    "throughDate": "2026-08-09",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 3,
      "stops": [
        {
          "placeId": "tumbleton",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E6",
              "scene": "Jon Roxton is depicted at the accepted tumbleton map anchor in S3E6.",
              "source": {
                "title": "House of the Dragon S3E6 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "House of the Dragon S3E6: “Faceless Men\" — televised episode record",
                "url": "https://gameofthrones.fandom.com/wiki/Faceless_Men_(episode)"
              }
            }
          ]
        }
      ]
    }
  ]
});
