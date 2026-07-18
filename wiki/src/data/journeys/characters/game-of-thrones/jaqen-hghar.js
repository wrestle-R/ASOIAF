import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "jaqen-hghar",
  "characterName": "Jaqen H'ghar",
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
          "placeId": "harrenhal",
          "appearances": [
            {
              "episode": "S2E5",
              "scene": "The Riverlands — Harrenhal; scene begins 0:22:37.",
              "source": {
                "title": "Game of Thrones S2E5: “The Ghost of Harrenhal” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/5-the-ghost-of-harrenhal"
              },
              "evidence": {
                "title": "Scene-level location index for S2E5",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S2E6",
              "scene": "The Riverlands — Harrenhal; scene begins 0:38:12.",
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
              "scene": "The Riverlands — Harrenhal; scene begins 0:24:55.",
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
              "scene": "The Riverlands — Outside Harrenhal; scene begins 0:36:43.",
              "source": {
                "title": "Game of Thrones S2E10: “Valar Morghulis” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-2/10-valar-morghulis"
              },
              "evidence": {
                "title": "Scene-level location index for S2E10",
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
