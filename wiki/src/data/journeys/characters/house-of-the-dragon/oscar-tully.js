import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "oscar-tully",
  "characterName": "Oscar Tully",
  "totalSeasons": 4,
  "coverage": {
    "throughEpisode": "S2E8",
    "throughDate": "2024-08-04",
    "completionReason": "season-complete"
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
          "auditDate": "2026-07-18",
          "appearances": [
            {
              "episode": "S2E7",
              "scene": "Oscar Tully is depicted at the accepted harrenhal map anchor in S2E7.",
              "source": {
                "title": "House of the Dragon S2E7 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Oscar Tully — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Oscar_Tully"
              }
            }
          ]
        }
      ]
    }
  ]
});
