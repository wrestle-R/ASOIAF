import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "ormund-hightower",
  "characterName": "Ormund Hightower",
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
              "episode": "S3E3",
              "scene": "Ormund Hightower is depicted at the accepted tumbleton map anchor in S3E3.",
              "source": {
                "title": "House of the Dragon S3E3 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "House of the Dragon S3E3: “Rhaenyra Triumphant\" — televised episode record",
                "url": "https://gameofthrones.fandom.com/wiki/Rhaenyra_Triumphant"
              }
            }
          ]
        }
      ]
    }
  ]
});
