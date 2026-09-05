import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "house-of-the-dragon",
  "seriesName": "House of the Dragon",
  "characterSlug": "sylvi",
  "characterName": "Sylvi",
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
              "episode": "S1E9",
              "scene": "Sylvi is depicted at the accepted kings-landing map anchor in S1E9.",
              "source": {
                "title": "House of the Dragon S1E9 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "Sylvi — television character record",
                "url": "https://gameofthrones.fandom.com/wiki/Sylvi"
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
          "placeId": "kings-landing",
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "reviewed episode-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-09-05",
          "appearances": [
            {
              "episode": "S3E7",
              "scene": "Sylvi is depicted at the accepted kings-landing map anchor in S3E7.",
              "source": {
                "title": "House of the Dragon S3E7 — HBO/WBD synopsis",
                "url": "https://press.wbd.com/us/property/house-dragon/synopses"
              },
              "evidence": {
                "title": "House of the Dragon S3E7: “The Dragon in Winter\" — televised episode record",
                "url": "https://gameofthrones.fandom.com/wiki/The_Dragon_in_Winter"
              }
            }
          ]
        }
      ]
    }
  ]
});
