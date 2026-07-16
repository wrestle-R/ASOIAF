import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "viserys-targaryen",
  "characterName": "Viserys Targaryen",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 1,
      "title": "Season 1: 2 mapped moves",
      "summary": "The screen record contains 3 ordered, source-backed location stops for this season.",
      "stops": [
        {
          "placeId": "pentos",
          "appearances": [
            {
              "episode": "S1E1",
              "scene": "Pentos; scene begins 0:33:45.",
              "source": {
                "title": "Game of Thrones S1E1: “Winter Is Coming” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/1-winter-is-coming"
              },
              "evidence": {
                "title": "Scene-level location index for S1E1",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "dothraki-sea",
          "appearances": [
            {
              "episode": "S1E2",
              "scene": "The Dothraki Sea; scene begins 0:02:22.",
              "source": {
                "title": "Game of Thrones S1E2: “The Kingsroad” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/2-the-kingsroad"
              },
              "evidence": {
                "title": "Scene-level location index for S1E2",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S1E3",
              "scene": "The Dothraki Sea; scene begins 0:34:39.",
              "source": {
                "title": "Game of Thrones S1E3: “Lord Snow” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/3-lord-snow"
              },
              "evidence": {
                "title": "Scene-level location index for S1E3",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "vaes-dothrak",
          "appearances": [
            {
              "episode": "S1E4",
              "scene": "Vaes Dothrak; scene begins 0:10:11.",
              "source": {
                "title": "Game of Thrones S1E4: “Cripples, Bastards, and Broken Things” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/4-cripples-bastards-and-broken-things"
              },
              "evidence": {
                "title": "Scene-level location index for S1E4",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S1E6",
              "scene": "Vaes Dothrak; scene begins 0:16:08.",
              "source": {
                "title": "Game of Thrones S1E6: “A Golden Crown” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/6-a-golden-crown"
              },
              "evidence": {
                "title": "Scene-level location index for S1E6",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    }
  ]
});
