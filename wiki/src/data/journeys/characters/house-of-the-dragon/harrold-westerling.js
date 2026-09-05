import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "harrold-westerling",
  "characterName": "Harrold Westerling",
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
              "episode": "S1E1",
              "scene": "Harrold Westerling is depicted at the accepted kings-landing map anchor in S1E1.",
              "source": {
                "title": "House of the Dragon S1E1 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Harrold Westerling — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Harrold_Westerling"
              }
            }
          ]
        }
      ]
    }
  ]
});
