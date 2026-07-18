import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "yoren",
  "characterName": "Yoren",
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
          "placeId": "castle-black",
          "appearances": [
            {
              "episode": "S1E3",
              "scene": "The Wall — Castle Black; scene begins 0:41:52.",
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
        },
        {
          "placeId": "winterfell",
          "appearances": [
            {
              "episode": "S1E4",
              "scene": "The North — Winterfell; scene begins 0:03:30.",
              "source": {
                "title": "Game of Thrones S1E4: “Cripples, Bastards, and Broken Things” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/4-cripples-bastards-and-broken-things"
              },
              "evidence": {
                "title": "Scene-level location index for S1E4",
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
          "placeId": "kings-landing",
          "appearances": [
            {
              "episode": "S1E5",
              "scene": "The Crownlands — King's Landing; scene begins 0:26:51.",
              "source": {
                "title": "Game of Thrones S1E5: “The Wolf and the Lion” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/5-the-wolf-and-the-lion"
              },
              "evidence": {
                "title": "Scene-level location index for S1E5",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S1E9",
              "scene": "The Crownlands — King's Landing; scene begins 0:50:24.",
              "source": {
                "title": "Game of Thrones S1E9: “Baelor” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/9-baelor"
              },
              "evidence": {
                "title": "Scene-level location index for S1E9",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S1E10",
              "scene": "The Crownlands — King's Landing; scene begins 0:02:17.",
              "source": {
                "title": "Game of Thrones S1E10: “Fire and Blood” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/10-fire-and-blood"
              },
              "evidence": {
                "title": "Scene-level location index for S1E10",
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
