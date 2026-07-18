import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "aeron-greyjoy",
  "characterName": "Aeron Greyjoy",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 6,
      "title": "Season 6",
      "summary": "",
      "stops": [
        {
          "placeId": "pyke",
          "appearances": [
            {
              "episode": "S6E2",
              "scene": "The Iron Islands — Pyke; scene begins 0:45:39.",
              "source": {
                "title": "Game of Thrones S6E2: “Home” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-6/2-home"
              },
              "evidence": {
                "title": "Scene-level location index for S6E2",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S6E5",
              "scene": "The Iron Islands — Pyke; scene begins 0:21:12.",
              "source": {
                "title": "Game of Thrones S6E5: “The Door” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-6/5-the-door"
              },
              "evidence": {
                "title": "Scene-level location index for S6E5",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ],
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "scene-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-07-18"
        }
      ]
    }
  ]
});
