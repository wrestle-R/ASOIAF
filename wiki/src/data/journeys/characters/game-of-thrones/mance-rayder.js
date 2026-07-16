import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "mance-rayder",
  "characterName": "Mance Rayder",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 3,
      "title": "Season 3: 2 mapped moves",
      "summary": "The screen record contains 3 ordered, source-backed location stops for this season.",
      "stops": [
        {
          "placeId": "the-frostfangs",
          "appearances": [
            {
              "episode": "S3E1",
              "scene": "North of the Wall — Frostfang Mountains; scene begins 0:07:40.",
              "source": {
                "title": "Game of Thrones S3E1: “Valar Dohaeris” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/1-valar-dohaeris"
              },
              "evidence": {
                "title": "Scene-level location index for S3E1",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "wildling-camp",
          "appearances": [
            {
              "episode": "S3E2",
              "scene": "North of the Wall — Wildlings March South; scene begins 0:24:23.",
              "source": {
                "title": "Game of Thrones S3E2: “Dark Wings, Dark Words” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/2-dark-wings-dark-words"
              },
              "evidence": {
                "title": "Scene-level location index for S3E2",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "the-fist",
          "appearances": [
            {
              "episode": "S3E3",
              "scene": "North of the Wall — Fist of the First Men; scene begins 0:18:37.",
              "source": {
                "title": "Game of Thrones S3E3: “Walk of Punishment” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/3-walk-of-punishment"
              },
              "evidence": {
                "title": "Scene-level location index for S3E3",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    },
    {
      "season": 4,
      "title": "Season 4: 1 mapped moves",
      "summary": "The screen record contains 2 ordered, source-backed location stops for this season.",
      "stops": [
        {
          "placeId": "haunted-forest",
          "appearances": [
            {
              "episode": "S4E10",
              "scene": "North of the Wall — The Haunted Forest; scene begins 0:04:04.",
              "source": {
                "title": "Game of Thrones S4E10: “The Children” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-4/10-the-children"
              },
              "evidence": {
                "title": "Scene-level location index for S4E10",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "beyond-the-wall",
          "appearances": [
            {
              "episode": "S4E10",
              "scene": "North of the Wall — The Wall; scene begins 0:09:18.",
              "source": {
                "title": "Game of Thrones S4E10: “The Children” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-4/10-the-children"
              },
              "evidence": {
                "title": "Scene-level location index for S4E10",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    },
    {
      "season": 5,
      "title": "Season 5: one verified place",
      "summary": "The screen record remains at one verified map location for this season.",
      "stops": [
        {
          "placeId": "castle-black",
          "appearances": [
            {
              "episode": "S5E1",
              "scene": "The Wall — Castle Black; scene begins 0:45:03.",
              "source": {
                "title": "Game of Thrones S5E1: “The Wars to Come” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-5/1-the-wars-to-come"
              },
              "evidence": {
                "title": "Scene-level location index for S5E1",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    }
  ]
});
