import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "corlys-velaryon",
  "characterName": "Corlys Velaryon",
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
              "episode": "S1E1",
              "scene": "Corlys Velaryon is depicted at the accepted kings-landing map anchor in S1E1.",
              "source": {
                "title": "House of the Dragon S1E1 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Corlys Velaryon — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Corlys_Velaryon"
              }
            }
          ]
        },
        {
          "placeId": "dragonstone",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-07-18",
          "appearances": [
            {
              "episode": "S1E10",
              "scene": "Corlys Velaryon is depicted at the accepted dragonstone map anchor in S1E10.",
              "source": {
                "title": "House of the Dragon S1E10 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Corlys Velaryon — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Corlys_Velaryon"
              }
            }
          ]
        }
      ]
    },
    {
      "season": 2,
      "stops": [
        {
          "placeId": "dragonstone",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-07-18",
          "appearances": [
            {
              "episode": "S2E1",
              "scene": "Corlys Velaryon is depicted at the accepted dragonstone map anchor in S2E1.",
              "source": {
                "title": "House of the Dragon S2E1 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Corlys Velaryon — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Corlys_Velaryon"
              }
            }
          ]
        }
      ]
    }
  ]
});
