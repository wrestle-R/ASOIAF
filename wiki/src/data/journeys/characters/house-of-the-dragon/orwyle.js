import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "orwyle",
  "characterName": "Orwyle",
  "totalSeasons": 3,
  "coverage": {
    "throughEpisode": "S3E8",
    "throughDate": "2026-08-09",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 1,
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
              "episode": "S1E6",
              "scene": "Orwyle is depicted at the accepted kings-landing map anchor in S1E6.",
              "source": {
                "title": "House of the Dragon S1E6 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Orwyle — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Orwyle"
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
          "placeId": "kings-landing",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E1",
              "scene": "Orwyle is depicted at the accepted kings-landing map anchor in S3E1.",
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
