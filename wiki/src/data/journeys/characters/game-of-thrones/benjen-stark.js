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
      "title": "Season 1",
      "summary": "",
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
          ],
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "scene-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-07-18"
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
