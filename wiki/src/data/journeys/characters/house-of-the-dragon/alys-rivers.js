import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "alys-rivers",
  "characterName": "Alys Rivers",
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
          "placeId": "harrenhal",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S2E3",
              "scene": "Alys Rivers is depicted at the accepted harrenhal map anchor in S2E3.",
              "source": {
                "title": "House of the Dragon S2E3 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Alys Rivers — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Alys_Rivers"
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
          "placeId": "harrenhal",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E1",
              "scene": "Alys Rivers is depicted at the accepted harrenhal map anchor in S3E1.",
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
