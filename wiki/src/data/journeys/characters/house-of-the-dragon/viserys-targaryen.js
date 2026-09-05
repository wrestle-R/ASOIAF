import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "viserys-targaryen",
  "characterName": "Viserys Targaryen",
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
