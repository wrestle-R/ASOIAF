import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "benjen-stark",
  "characterName": "Benjen Stark",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 1,
      "title": "Season 1: 3 mapped moves",
      "summary": "The screen record contains 4 ordered, source-backed location stops for this season.",
      "stops": [
        {
          "placeId": "winterfell",
          "appearances": [
            {
              "episode": "S1E1",
              "scene": "The North — Winterfell; scene begins 0:41:19.",
              "source": {
                "title": "Game of Thrones S1E1: “Winter Is Coming” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/1-winter-is-coming"
              },
              "evidence": {
                "title": "Scene-level location index for S1E1",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S1E2",
              "scene": "The North — Winterfell; scene begins 0:20:07.",
              "source": {
                "title": "Game of Thrones S1E2: “The Kingsroad” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/2-the-kingsroad"
              },
              "evidence": {
                "title": "Scene-level location index for S1E2",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "north-road",
          "appearances": [
            {
              "episode": "S1E2",
              "scene": "The North — North to the Wall; scene begins 0:25:56.",
              "source": {
                "title": "Game of Thrones S1E2: “The Kingsroad” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/2-the-kingsroad"
              },
              "evidence": {
                "title": "Scene-level location index for S1E2",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "the-gift",
          "appearances": [
            {
              "episode": "S1E2",
              "scene": "The Wall — The Gift; scene begins 0:34:21.",
              "source": {
                "title": "Game of Thrones S1E2: “The Kingsroad” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/2-the-kingsroad"
              },
              "evidence": {
                "title": "Scene-level location index for S1E2",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "castle-black",
          "appearances": [
            {
              "episode": "S1E3",
              "scene": "The Wall — Castle Black; scene begins 0:38:17.",
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
        }
      ]
    },
    {
      "season": 6,
      "title": "Season 6: 1 mapped moves",
      "summary": "The screen record contains 2 ordered, source-backed location stops for this season.",
      "stops": [
        {
          "placeId": "three-eyed-raven-cave",
          "appearances": [
            {
              "episode": "S6E6",
              "scene": "North of the Wall — Outside the Three-Eyed Raven; scene begins 0:07:33.",
              "source": {
                "title": "Game of Thrones S6E6: “Blood of My Blood” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-6/6-blood-of-my-blood"
              },
              "evidence": {
                "title": "Scene-level location index for S6E6",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "haunted-forest",
          "appearances": [
            {
              "episode": "S6E10",
              "scene": "North of the Wall — The Haunted Forest; scene begins 0:56:05.",
              "source": {
                "title": "Game of Thrones S6E10: “The Winds of Winter” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-6/10-the-winds-of-winter"
              },
              "evidence": {
                "title": "Scene-level location index for S6E10",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    },
    {
      "season": 7,
      "title": "Season 7: one verified place",
      "summary": "The screen record remains at one verified map location for this season.",
      "stops": [
        {
          "placeId": "haunted-forest",
          "appearances": [
            {
              "episode": "S7E6",
              "scene": "North of the Wall — The Haunted Forest; scene begins 0:58:03.",
              "source": {
                "title": "Game of Thrones S7E6: “Beyond the Wall” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-7/6-beyond-the-wall"
              },
              "evidence": {
                "title": "Scene-level location index for S7E6",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    }
  ]
});
