import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "craster",
  "characterName": "Craster",
  "totalSeasons": 8,
  "coverage": {
    "throughEpisode": "S8E6",
    "throughDate": "2019-05-19",
    "completionReason": "series-complete"
  },
  "seasons": [
    {
      "season": 2,
      "title": "Season 2",
      "summary": "",
      "stops": [
        {
          "placeId": "crasters-keep",
          "appearances": [
            {
              "episode": "S2E1",
              "scene": "North of the Wall — Craster's Keep; scene begins 0:20:31.",
              "source": {
                "title": "Game of Thrones S2E1: “The North Remembers” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/1-the-north-remembers"
              },
              "evidence": {
                "title": "Scene-level location index for S2E1",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S2E2",
              "scene": "North of the Wall — Craster's Keep; scene begins 0:49:57.",
              "source": {
                "title": "Game of Thrones S2E2: “The Night Lands” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/2-the-night-lands"
              },
              "evidence": {
                "title": "Scene-level location index for S2E2",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S2E3",
              "scene": "North of the Wall — Craster's Keep; scene begins 0:01:53.",
              "source": {
                "title": "Game of Thrones S2E3: “What Is Dead May Never Die” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/3-what-is-dead-may-never-die"
              },
              "evidence": {
                "title": "Scene-level location index for S2E3",
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
      "season": 3,
      "title": "Season 3",
      "summary": "",
      "stops": [
        {
          "placeId": "crasters-keep",
          "appearances": [
            {
              "episode": "S3E3",
              "scene": "North of the Wall — Craster's Keep; scene begins 0:21:30.",
              "source": {
                "title": "Game of Thrones S3E3: “Walk of Punishment” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/3-walk-of-punishment"
              },
              "evidence": {
                "title": "Scene-level location index for S3E3",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S3E4",
              "scene": "North of the Wall — Craster's Keep; scene begins 0:36:28.",
              "source": {
                "title": "Game of Thrones S3E4: “And Now His Watch Is Ended” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/4-and-now-his-watch-is-ended"
              },
              "evidence": {
                "title": "Scene-level location index for S3E4",
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
