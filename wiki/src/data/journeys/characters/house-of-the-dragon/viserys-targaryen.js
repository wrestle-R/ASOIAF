import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "viserys-targaryen",
  "characterName": "Viserys Targaryen",
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
          "placeId": "dragonstone",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-07-18",
          "appearances": [
            {
              "episode": "S1E10",
              "scene": "Viserys Targaryen is depicted at the accepted dragonstone map anchor in S1E10.",
              "source": {
                "title": "House of the Dragon S1E10 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Viserys Targaryen — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Viserys_Targaryen_(son_of_Rhaenyra)"
              }
            }
          ]
        }
      ]
    }
  ]
});
