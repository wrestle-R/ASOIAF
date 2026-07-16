import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "qhorin-halfhand",
  "characterName": "Qhorin Halfhand",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 2,
      "title": "Season 2: 1 mapped moves",
      "summary": "The screen record contains 2 ordered, source-backed location stops for this season.",
      "stops": [
        {
          "placeId": "the-fist",
          "appearances": [
            {
              "episode": "S2E5",
              "scene": "North of the Wall — Fist of the First Men; scene begins 0:43:25.",
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
        },
        {
          "placeId": "the-frostfangs",
          "appearances": [
            {
              "episode": "S2E6",
              "scene": "North of the Wall — Frostfang Mountains; scene begins 0:10:03.",
              "source": {
                "title": "Game of Thrones S2E6: “The Old Gods and the New” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/6-the-old-gods-and-the-new"
              },
              "evidence": {
                "title": "Scene-level location index for S2E6",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S2E8",
              "scene": "North of the Wall — Frostfang Mountains; scene begins 0:05:53.",
              "source": {
                "title": "Game of Thrones S2E8: “The Prince of Winterfell” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/8-the-prince-of-winterfell"
              },
              "evidence": {
                "title": "Scene-level location index for S2E8",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S2E10",
              "scene": "North of the Wall — Frostfang Mountains; scene begins 0:51:47.",
              "source": {
                "title": "Game of Thrones S2E10: “Valar Morghulis” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/10-valar-morghulis"
              },
              "evidence": {
                "title": "Scene-level location index for S2E10",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            }
          ]
        }
      ]
    }
  ]
});
