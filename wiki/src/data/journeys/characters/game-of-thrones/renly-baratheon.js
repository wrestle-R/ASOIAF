import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "renly-baratheon",
  "characterName": "Renly Baratheon",
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
          "placeId": "kings-landing",
          "appearances": [
            {
              "episode": "S1E3",
              "scene": "The Crownlands — King's Landing; scene begins 0:05:17.",
              "source": {
                "title": "Game of Thrones S1E3: “Lord Snow” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/3-lord-snow"
              },
              "evidence": {
                "title": "Scene-level location index for S1E3",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S1E4",
              "scene": "The Crownlands — King's Landing; scene begins 0:18:53.",
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
              "episode": "S1E5",
              "scene": "The Crownlands — King's Landing; scene begins 0:06:23.",
              "source": {
                "title": "Game of Thrones S1E5: “The Wolf and the Lion” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/5-the-wolf-and-the-lion"
              },
              "evidence": {
                "title": "Scene-level location index for S1E5",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        },
        {
          "placeId": "kingswood",
          "appearances": [
            {
              "episode": "S1E6",
              "scene": "The Crownlands — The Kingswood; scene begins 0:29:27.",
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
        },
        {
          "placeId": "kings-landing",
          "appearances": [
            {
              "episode": "S1E7",
              "scene": "The Crownlands — King's Landing; scene begins 0:19:59.",
              "source": {
                "title": "Game of Thrones S1E7: “You Win or You Die” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/7-you-win-or-you-die"
              },
              "evidence": {
                "title": "Scene-level location index for S1E7",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    },
    {
      "season": 2,
      "title": "Season 2: one verified place",
      "summary": "The screen record remains at one verified map location for this season.",
      "stops": [
        {
          "placeId": "storms-end",
          "appearances": [
            {
              "episode": "S2E3",
              "scene": "The Stormlands — Storm's End; scene begins 0:09:16.",
              "source": {
                "title": "Game of Thrones S2E3: “What Is Dead May Never Die” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/3-what-is-dead-may-never-die"
              },
              "evidence": {
                "title": "Scene-level location index for S2E3",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S2E4",
              "scene": "The Stormlands — Storm's End; scene begins 0:14:56.",
              "source": {
                "title": "Game of Thrones S2E4: “Garden of Bones” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/4-garden-of-bones"
              },
              "evidence": {
                "title": "Scene-level location index for S2E4",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S2E5",
              "scene": "The Stormlands — Storm's End; scene begins 0:01:54.",
              "source": {
                "title": "Game of Thrones S2E5: “The Ghost of Harrenhal” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/5-the-ghost-of-harrenhal"
              },
              "evidence": {
                "title": "Scene-level location index for S2E5",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    }
  ]
});
