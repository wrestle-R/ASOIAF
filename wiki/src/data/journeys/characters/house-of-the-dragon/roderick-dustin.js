import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "roderick-dustin",
  "characterName": "Roderick Dustin",
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
          "placeId": "harrenhal",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E1",
              "scene": "Roderick Dustin is depicted at the accepted harrenhal map anchor in S3E1.",
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
          "placeId": "tumbleton",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E8",
              "scene": "Roderick Dustin is depicted at the accepted tumbleton map anchor in S3E8.",
              "source": {
                "title": "House of the Dragon S3E8 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "House of the Dragon S3E8: “The Treasons at Tumbleton\" — televised episode record",
                "url": "https://gameofthrones.fandom.com/wiki/The_Treasons_at_Tumbleton"
              }
            }
          ]
        }
      ]
    }
  ]
});
