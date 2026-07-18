import { createJourney } from "../../builders.js";

export default createJourney({
  "seriesSlug": "game-of-thrones",
  "seriesName": "Game of Thrones",
  "characterSlug": "viserys-targaryen",
  "characterName": "Viserys Targaryen",
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
          "placeId": "pentos",
          "appearances": [
            {
              "episode": "S1E1",
              "scene": "Pentos; scene begins 0:33:45.",
              "source": {
                "title": "Game of Thrones S1E1: “Winter Is Coming” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/1-winter-is-coming"
              },
              "evidence": {
                "title": "Scene-level location index for S1E1",
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
          "placeId": "vaes-dothrak",
          "appearances": [
            {
              "episode": "S1E4",
              "scene": "Vaes Dothrak; scene begins 0:10:11.",
              "source": {
                "title": "Game of Thrones S1E4: “Cripples, Bastards, and Broken Things” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/4-cripples-bastards-and-broken-things"
              },
              "evidence": {
                "title": "Scene-level location index for S1E4",
                "url": "https://github.com/jeffreylancaster/game-of-thrones/blob/master/data/episodes.json"
              }
            },
            {
              "episode": "S1E6",
              "scene": "Vaes Dothrak; scene begins 0:16:08.",
              "source": {
                "title": "Game of Thrones S1E6: “A Golden Crown” — HBO",
                "url": "https://www.hbo.com/game-of-thrones/season-1/6-a-golden-crown"
              },
              "evidence": {
                "title": "Scene-level location index for S1E6",
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
