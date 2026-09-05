import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "jeyne-arryn",
  "characterName": "Jeyne Arryn",
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
          "placeId": "eyrie",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S2E8",
              "scene": "Jeyne Arryn is depicted at the accepted eyrie map anchor in S2E8.",
              "source": {
                "title": "House of the Dragon S2E8 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Jeyne Arryn — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Jeyne_Arryn"
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
          "placeId": "eyrie",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E2",
              "scene": "Jeyne Arryn is depicted at the accepted eyrie map anchor in S3E2.",
              "source": {
                "title": "House of the Dragon S3E2 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "House of the Dragon S3E2: “Queen's Landing\" — televised episode record",
                "url": "https://gameofthrones.fandom.com/wiki/Queen's_Landing"
              }
            }
          ]
        }
      ]
    }
  ]
});
