import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "daeron-targaryen",
  "characterName": "Daeron Targaryen",
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
              "episode": "S3E4",
              "scene": "Daeron Targaryen is depicted at the accepted tumbleton map anchor in S3E4.",
              "source": {
                "title": "House of the Dragon S3E4 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "House of the Dragon S3E4: “Tumbleton\" — televised episode record",
                "url": "https://gameofthrones.fandom.com/wiki/Tumbleton_(episode)"
              }
            }
          ]
        }
      ]
    }
  ]
});
