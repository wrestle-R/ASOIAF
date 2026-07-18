import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "balon-greyjoy",
  "characterName": "Balon Greyjoy",
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
          "placeId": "pyke",
          "appearances": [
            {
              "episode": "S2E2",
              "scene": "The Iron Islands — Pyke; scene begins 0:35:01.",
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
              "scene": "The Iron Islands — Pyke; scene begins 0:14:45.",
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
          "placeId": "pyke",
          "appearances": [
            {
              "episode": "S3E10",
              "scene": "The Iron Islands — Pyke; scene begins 0:23:56.",
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
      "season": 6,
      "title": "Season 6",
      "summary": "",
      "stops": [
        {
          "placeId": "pyke",
          "appearances": [
            {
              "episode": "S6E2",
              "scene": "The Iron Islands — Pyke; scene begins 0:41:26.",
              "source": {
                "title": "Game of Thrones S6E2: “Home” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-6/2-home"
              },
              "evidence": {
                "title": "Scene-level location index for S6E2",
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
