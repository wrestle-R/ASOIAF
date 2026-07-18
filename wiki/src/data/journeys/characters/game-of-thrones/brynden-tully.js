import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "brynden-tully",
  "characterName": "Brynden Tully",
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
          "placeId": "riverrun",
          "appearances": [
            {
              "episode": "S3E3",
              "scene": "The Riverlands — Riverrun; scene begins 0:01:55.",
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
              "episode": "S3E5",
              "scene": "The Riverlands — Riverrun; scene begins 0:21:07.",
              "source": {
                "title": "Game of Thrones S3E5: “Kissed by Fire” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/5-kissed-by-fire"
              },
              "evidence": {
                "title": "Scene-level location index for S3E5",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S3E6",
              "scene": "The Riverlands — Riverrun; scene begins 0:27:39.",
              "source": {
                "title": "Game of Thrones S3E6: “The Climb” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/6-the-climb"
              },
              "evidence": {
                "title": "Scene-level location index for S3E6",
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
          "placeId": "the-twins",
          "appearances": [
            {
              "episode": "S3E9",
              "scene": "The Riverlands — The Twins; scene begins 0:04:12.",
              "source": {
                "title": "Game of Thrones S3E9: “The Rains of Castamere” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/9-the-rains-of-castamere"
              },
              "evidence": {
                "title": "Scene-level location index for S3E9",
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
          "placeId": "riverrun",
          "appearances": [
            {
              "episode": "S6E7",
              "scene": "The Riverlands — Riverrun; scene begins 0:22:32.",
              "source": {
                "title": "Game of Thrones S6E7: “The Broken Man” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-6/7-the-broken-man"
              },
              "evidence": {
                "title": "Scene-level location index for S6E7",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S6E8",
              "scene": "The Riverlands — Riverrun; scene begins 0:24:08.",
              "source": {
                "title": "Game of Thrones S6E8: “No One” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-6/8-no-one"
              },
              "evidence": {
                "title": "Scene-level location index for S6E8",
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
