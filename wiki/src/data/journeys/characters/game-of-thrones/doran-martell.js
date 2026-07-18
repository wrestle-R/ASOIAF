import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "doran-martell",
  "characterName": "Doran Martell",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 5,
      "title": "Season 5",
      "summary": "",
      "stops": [
        {
          "placeId": "water-gardens",
          "appearances": [
            {
              "episode": "S5E2",
              "scene": "Dorne — The Water Gardens; scene begins 0:21:52.",
              "source": {
                "title": "Game of Thrones S5E2: “The House of Black and White” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-5/2-the-house-of-black-and-white"
              },
              "evidence": {
                "title": "Scene-level location index for S5E2",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S5E6",
              "scene": "Dorne — The Water Gardens; scene begins 0:29:49.",
              "source": {
                "title": "Game of Thrones S5E6: “Unbowed, Unbent, Unbroken” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-5/6-unbowed-unbent-unbroken"
              },
              "evidence": {
                "title": "Scene-level location index for S5E6",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S5E9",
              "scene": "Dorne — The Water Gardens; scene begins 0:13:38.",
              "source": {
                "title": "Game of Thrones S5E9: “The Dance of Dragons” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-5/9-the-dance-of-dragons"
              },
              "evidence": {
                "title": "Scene-level location index for S5E9",
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
    },
    {
      "season": 6,
      "title": "Season 6",
      "summary": "",
      "stops": [
        {
          "placeId": "water-gardens",
          "appearances": [
            {
              "episode": "S6E1",
              "scene": "Dorne — The Water Gardens; scene begins 0:30:44.",
              "source": {
                "title": "Game of Thrones S6E1: “The Red Woman” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-6/1-the-red-woman"
              },
              "evidence": {
                "title": "Scene-level location index for S6E1",
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
