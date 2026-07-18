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
      "title": "Season 3",
      "summary": "",
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
          ],
          "depiction": "depicted",
          "reviewStatus": "accepted",
          "evidenceType": "scene-level depiction",
          "reviewer": "ASOIAF map audit",
          "auditDate": "2026-07-18"
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
      "season": 5,
      "title": "Season 5",
      "summary": "",
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
