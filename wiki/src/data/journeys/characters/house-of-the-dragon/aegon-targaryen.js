import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "aegon-targaryen",
  "characterName": "Aegon Targaryen",
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
          "placeId": "dragonstone",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S1E10",
              "scene": "Aegon Targaryen is depicted at the accepted dragonstone map anchor in S1E10.",
              "source": {
                "title": "House of the Dragon S1E10 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Aegon Targaryen — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Aegon_Targaryen_(son_of_Rhaenyra)"
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
              "scene": "Aegon Targaryen is depicted at the accepted eyrie map anchor in S3E2.",
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
