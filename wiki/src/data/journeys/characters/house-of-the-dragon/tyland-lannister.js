import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "tyland-lannister",
  "characterName": "Tyland Lannister",
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
              "episode": "S1E3",
              "scene": "Tyland Lannister is depicted at the accepted kings-landing map anchor in S1E3.",
              "source": {
                "title": "House of the Dragon S1E3 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Tyland Lannister — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Tyland_Lannister"
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
          "placeId": "gullet",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E1",
              "scene": "Tyland Lannister is depicted at the accepted gullet map anchor in S3E1.",
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
        },
        {
          "placeId": "rooks-rest",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E5",
              "scene": "Tyland Lannister is depicted at the accepted rooks-rest map anchor in S3E5.",
              "source": {
                "title": "House of the Dragon S3E5 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "House of the Dragon S3E5: “Unbowed and Unbent\" — televised episode record",
                "url": "https://gameofthrones.fandom.com/wiki/Unbowed_and_Unbent"
              }
            }
          ]
        }
      ]
    }
  ]
});
