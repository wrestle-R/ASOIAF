import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "sharako-lohar",
  "characterName": "Sharako Lohar",
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
          "placeId": "gullet",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E1",
              "scene": "Sharako Lohar is depicted at the accepted gullet map anchor in S3E1.",
              "source": {
                "title": "House of the Dragon S3E1 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "House of the Dragon S3E1: “Salt and Sea, Fire and Blood\" — televised episode record",
                "url": "https://gameofthrones.fandom.com/wiki/Salt_and_Sea%2C_Fire_and_Blood"
              }
            }
          ]
        }
      ]
    }
  ]
});
