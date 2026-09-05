import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "willem-blackwood",
  "characterName": "Willem Blackwood",
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
              "episode": "S2E4",
              "scene": "Willem Blackwood is depicted at the accepted harrenhal map anchor in S2E4.",
              "source": {
                "title": "House of the Dragon S2E4 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Willem Blackwood — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Willem_Blackwood"
              }
            }
          ]
        }
      ]
    }
  ]
});
