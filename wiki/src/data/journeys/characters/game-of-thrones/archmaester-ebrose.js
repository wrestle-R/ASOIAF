import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "archmaester-ebrose",
  "characterName": "Archmaester Ebrose",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 7,
      "title": "Season 7",
      "summary": "",
      "stops": [
        {
          "placeId": "oldtown",
          "appearances": [
            {
              "episode": "S7E1",
              "scene": "The Reach — Oldtown; scene begins 0:33:19.",
              "source": {
                "title": "Game of Thrones S7E1: “Dragonstone” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-7/1-dragonstone"
              },
              "evidence": {
                "title": "Scene-level location index for S7E1",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S7E2",
              "scene": "The Reach — Oldtown; scene begins 0:18:21.",
              "source": {
                "title": "Game of Thrones S7E2: “Stormborn” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-7/2-stormborn"
              },
              "evidence": {
                "title": "Scene-level location index for S7E2",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S7E3",
              "scene": "The Reach — Oldtown; scene begins 0:47:32.",
              "source": {
                "title": "Game of Thrones S7E3: “The Queen's Justice” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-7/3-the-queens-justice"
              },
              "evidence": {
                "title": "Scene-level location index for S7E3",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S7E5",
              "scene": "The Reach — Oldtown; scene begins 0:20:26.",
              "source": {
                "title": "Game of Thrones S7E5: “Eastwatch” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-7/5-eastwatch"
              },
              "evidence": {
                "title": "Scene-level location index for S7E5",
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
