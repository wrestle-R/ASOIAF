import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "steffon-darklyn",
  "characterName": "Steffon Darklyn",
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
          "placeId": "dragonstone",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S2E1",
              "scene": "Steffon Darklyn is depicted at the accepted dragonstone map anchor in S2E1.",
              "source": {
                "title": "House of the Dragon S2E1 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Steffon Darklyn — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Steffon_Darklyn"
              }
            }
          ]
        }
      ]
    }
  ]
});
