import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "a-knight-of-the-seven-kingdoms",
  "seriesName": "A Knight of the Seven Kingdoms",
  "characterSlug": "ser-duncan-the-tall",
  "characterName": "Ser Duncan the Tall",
  "totalSeasons": 1,
  "coverage": {
    "throughEpisode": "S1E6",
    "throughDate": "2026-02-22",
    "completionReason": "season-complete"
  },
  "seasons": [
    {
      "season": 1,
      "title": "Season 1 at Ashford",
      "summary": "",
      "stops": [
        {
          "placeId": "ashford-meadow",
          "depiction": "officially_inferred",
          "reviewStatus": "accepted",
          "evidenceType": "official synopsis endpoint",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-07-18",
          "appearances": [
            {
              "episode": "S1E1",
              "scene": "The official synopsis states that Dunk travels to Ashford for a tournament.",
              "source": {
                "title": "A Knight of the Seven Kingdoms S1E1: “The Hedge Knight” — HBO",
                "url": "https://press.wbd.com/na/property/knight-seven-kingdoms/synopses"
              },
              "evidence": {
                "title": "A Knight of the Seven Kingdoms S1E1: “The Hedge Knight” — HBO",
                "url": "https://press.wbd.com/na/property/knight-seven-kingdoms/synopses"
              }
            }
          ]
        }
      ]
    }
  ]
});
