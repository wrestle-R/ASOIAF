import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "gwayne-hightower",
  "characterName": "Gwayne Hightower",
  "totalSeasons": 3,
  "coverage": {
    "throughEpisode": "S3E8",
    "throughDate": "2026-08-09",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 2,
      "stops": [
        {
          "placeId": "kings-landing",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S2E3",
              "scene": "Gwayne Hightower is depicted at the accepted kings-landing map anchor in S2E3.",
              "source": {
                "title": "House of the Dragon S2E3 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Gwayne Hightower — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Gwayne_Hightower"
              }
            }
          ]
        }
      ]
    },
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
              "scene": "Gwayne Hightower is depicted at the accepted tumbleton map anchor in S3E4.",
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
