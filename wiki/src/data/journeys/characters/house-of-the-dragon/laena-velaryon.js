import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "laena-velaryon",
  "characterName": "Laena Velaryon",
  "totalSeasons": 4,
  "coverage": {
    "throughEpisode": "S2E8",
    "throughDate": "2024-08-04",
    "completionReason": "season-complete"
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
          "auditDate": "2026-07-18",
          "appearances": [
            {
              "episode": "S1E5",
              "scene": "Laena Velaryon is depicted at the accepted kings-landing map anchor in S1E5.",
              "source": {
                "title": "House of the Dragon S1E5 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Laena Velaryon — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Laena_Velaryon"
              }
            }
          ]
        },
        {
          "placeId": "pentos",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-07-18",
          "appearances": [
            {
              "episode": "S1E6",
              "scene": "Laena Velaryon is depicted at the accepted pentos map anchor in S1E6.",
              "source": {
                "title": "House of the Dragon S1E6 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Laena Velaryon — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Laena_Velaryon"
              }
            }
          ]
        }
      ]
    }
  ]
});
