import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "thoros-of-myr",
  "characterName": "Thoros of Myr",
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
          "placeId": "hollow-hill",
          "appearances": [
            {
              "episode": "S3E4",
              "scene": "The Riverlands — Hollow Hill; scene begins 0:40:29.",
              "source": {
                "title": "Game of Thrones S3E4: “And Now His Watch Is Ended” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/4-and-now-his-watch-is-ended"
              },
              "evidence": {
                "title": "Scene-level location index for S3E4",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S3E5",
              "scene": "The Riverlands — Hollow Hill; scene begins 0:01:54.",
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
              "scene": "The Riverlands — Hollow Hill; scene begins 0:12:12.",
              "source": {
                "title": "Game of Thrones S3E6: “The Climb” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/6-the-climb"
              },
              "evidence": {
                "title": "Scene-level location index for S3E6",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S3E7",
              "scene": "The Riverlands — Hollow Hill; scene begins 0:30:01.",
              "source": {
                "title": "Game of Thrones S3E7: “The Bear and the Maiden Fair” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-3/7-the-bear-and-the-maiden-fair"
              },
              "evidence": {
                "title": "Scene-level location index for S3E7",
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
      "season": 7,
      "title": "Season 7",
      "summary": "",
      "stops": [
        {
          "placeId": "eastwatch",
          "appearances": [
            {
              "episode": "S7E5",
              "scene": "The Wall — Eastwatch; scene begins 0:55:47.",
              "source": {
                "title": "Game of Thrones S7E5: “Eastwatch” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-7/5-eastwatch"
              },
              "evidence": {
                "title": "Scene-level location index for S7E5",
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
