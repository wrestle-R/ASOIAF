import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "jason-lannister",
  "characterName": "Jason Lannister",
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
              "scene": "Jason Lannister is depicted at the accepted kings-landing map anchor in S1E3.",
              "source": {
                "title": "House of the Dragon S1E3 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Jason Lannister — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Jason_Lannister"
              }
            }
          ]
        }
      ]
    }
  ]
});
