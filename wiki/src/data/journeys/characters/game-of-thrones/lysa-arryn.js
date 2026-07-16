import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "lysa-arryn",
  "characterName": "Lysa Arryn",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 1,
      "title": "Season 1: one verified place",
      "summary": "The screen record remains at one verified map location for this season.",
      "stops": [
        {
          "placeId": "eyrie",
          "appearances": [
            {
              "episode": "S1E5",
              "scene": "The Vale — The Eyrie; scene begins 0:35:13.",
              "source": {
                "title": "Game of Thrones S1E5: “The Wolf and the Lion” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/5-the-wolf-and-the-lion"
              },
              "evidence": {
                "title": "Scene-level location index for S1E5",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S1E6",
              "scene": "The Vale — The Eyrie; scene begins 0:23:52.",
              "source": {
                "title": "Game of Thrones S1E6: “A Golden Crown” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/6-a-golden-crown"
              },
              "evidence": {
                "title": "Scene-level location index for S1E6",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S1E8",
              "scene": "The Vale — The Eyrie; scene begins 0:16:37.",
              "source": {
                "title": "Game of Thrones S1E8: “The Pointy End” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/8-the-pointy-end"
              },
              "evidence": {
                "title": "Scene-level location index for S1E8",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    },
    {
      "season": 4,
      "title": "Season 4: one verified place",
      "summary": "The screen record remains at one verified map location for this season.",
      "stops": [
        {
          "placeId": "eyrie",
          "appearances": [
            {
              "episode": "S4E5",
              "scene": "The Vale — The Eyrie; scene begins 0:12:22.",
              "source": {
                "title": "Game of Thrones S4E5: “First of His Name” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-4/5-first-of-his-name"
              },
              "evidence": {
                "title": "Scene-level location index for S4E5",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S4E7",
              "scene": "The Vale — The Eyrie; scene begins 0:45:39.",
              "source": {
                "title": "Game of Thrones S4E7: “Mockingbird” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-4/7-mockingbird"
              },
              "evidence": {
                "title": "Scene-level location index for S4E7",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    }
  ]
});
