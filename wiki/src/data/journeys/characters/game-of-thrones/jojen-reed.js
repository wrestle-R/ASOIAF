import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "jojen-reed",
  "characterName": "Jojen Reed",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 3,
      "title": "Season 3",
      "summary": "",
      "stops": [
        {
          "placeId": "nightfort",
          "appearances": [
            {
              "episode": "S3E10",
              "scene": "The Wall — Nightfort; scene begins 0:12:54.",
              "source": {
                "title": "Game of Thrones S3E10: “Mhysa” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/10-mhysa"
              },
              "evidence": {
                "title": "Scene-level location index for S3E10",
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
      "season": 4,
      "title": "Season 4",
      "summary": "",
      "stops": [
        {
          "placeId": "crasters-keep",
          "appearances": [
            {
              "episode": "S4E4",
              "scene": "North of the Wall — Craster's Keep; scene begins 0:45:49.",
              "source": {
                "title": "Game of Thrones S4E4: “Oathkeeper” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-4/4-oathkeeper"
              },
              "evidence": {
                "title": "Scene-level location index for S4E4",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S4E5",
              "scene": "North of the Wall — Craster's Keep; scene begins 0:36:57.",
              "source": {
                "title": "Game of Thrones S4E5: “First of His Name” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-4/5-first-of-his-name"
              },
              "evidence": {
                "title": "Scene-level location index for S4E5",
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
