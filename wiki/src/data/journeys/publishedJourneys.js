import { JOURNEY_MAP, PLACES } from "./places.js";

const HBO_BASE_URL = "https://www.hbo.com/game-of-thrones";

function episode(season, number, title, slug) {
  return Object.freeze({
    episode: `S${season}E${number}`,
    source: Object.freeze({
      title: `Game of Thrones S${season}E${number}: “${title}” — HBO`,
      url: `${HBO_BASE_URL}/season-${season}/${number}-${slug}`,
    }),
  });
}

const EPISODES = Object.freeze({
  s1e1: episode(1, 1, "Winter Is Coming", "winter-is-coming"),
  s1e2: episode(1, 2, "The Kingsroad", "the-kingsroad"),
  s1e3: episode(1, 3, "Lord Snow", "lord-snow"),
  s1e4: episode(1, 4, "Cripples, Bastards, and Broken Things", "cripples-bastards-and-broken-things"),
  s1e6: episode(1, 6, "A Golden Crown", "a-golden-crown"),
  s1e8: episode(1, 8, "The Pointy End", "the-pointy-end"),
  s1e9: episode(1, 9, "Baelor", "baelor"),
  s2e1: episode(2, 1, "The North Remembers", "the-north-remembers"),
  s2e2: episode(2, 2, "The Night Lands", "the-night-lands"),
  s2e3: episode(2, 3, "What Is Dead May Never Die", "what-is-dead-may-never-die"),
  s2e4: episode(2, 4, "Garden of Bones", "garden-of-bones"),
  s2e5: episode(2, 5, "The Ghost of Harrenhal", "the-ghost-of-harrenhal"),
  s2e8: episode(2, 8, "The Prince of Winterfell", "the-prince-of-winterfell"),
  s2e9: episode(2, 9, "Blackwater", "blackwater"),
  s3e1: episode(3, 1, "Valar Dohaeris", "valar-dohaeris"),
  s3e2: episode(3, 2, "Dark Wings, Dark Words", "dark-wings-dark-words"),
  s3e5: episode(3, 5, "Kissed by Fire", "kissed-by-fire"),
  s3e7: episode(3, 7, "The Bear and the Maiden Fair", "the-bear-and-the-maiden-fair"),
  s3e9: episode(3, 9, "The Rains of Castamere", "the-rains-of-castamere"),
  s3e10: episode(3, 10, "Mhysa", "mhysa"),
  s4e1: episode(4, 1, "Two Swords", "two-swords"),
  s4e3: episode(4, 3, "Breaker of Chains", "breaker-of-chains"),
  s4e5: episode(4, 5, "First of His Name", "first-of-his-name"),
  s4e7: episode(4, 7, "Mockingbird", "mockingbird"),
  s4e8: episode(4, 8, "The Mountain and the Viper", "the-mountain-and-the-viper"),
  s4e9: episode(4, 9, "The Watchers on the Wall", "the-watchers-on-the-wall"),
  s4e10: episode(4, 10, "The Children", "the-children"),
  s5e1: episode(5, 1, "The Wars to Come", "the-wars-to-come"),
  s5e2: episode(5, 2, "The House of Black and White", "the-house-of-black-and-white"),
  s5e3: episode(5, 3, "High Sparrow", "high-sparrow"),
  s5e5: episode(5, 5, "Kill the Boy", "kill-the-boy"),
  s5e7: episode(5, 7, "The Gift", "the-gift"),
  s5e8: episode(5, 8, "Hardhome", "hardhome"),
  s5e9: episode(5, 9, "The Dance of Dragons", "the-dance-of-dragons"),
  s5e10: episode(5, 10, "Mother's Mercy", "mothers-mercy"),
  s6e1: episode(6, 1, "The Red Woman", "the-red-woman"),
  s6e2: episode(6, 2, "Home", "home"),
  s6e4: episode(6, 4, "Book of the Stranger", "book-of-the-stranger"),
  s6e8: episode(6, 8, "No One", "no-one"),
  s6e9: episode(6, 9, "Battle of the Bastards", "battle-of-the-bastards"),
  s6e10: episode(6, 10, "The Winds of Winter", "the-winds-of-winter"),
  s7e1: episode(7, 1, "Dragonstone", "dragonstone"),
  s7e3: episode(7, 3, "The Queen's Justice", "the-queens-justice"),
  s7e4: episode(7, 4, "The Spoils of War", "the-spoils-of-war"),
  s7e5: episode(7, 5, "Eastwatch", "eastwatch"),
  s7e6: episode(7, 6, "Beyond the Wall", "beyond-the-wall"),
  s7e7: episode(7, 7, "The Dragon and the Wolf", "the-dragon-and-the-wolf"),
  s8e1: episode(8, 1, "Winterfell", "winterfell"),
  s8e4: episode(8, 4, "The Last of the Starks", "the-last-of-the-starks"),
  s8e5: episode(8, 5, "The Bells", "the-bells"),
  s8e6: episode(8, 6, "The Iron Throne", "the-iron-throne"),
});

function depicted(placeId, evidence) {
  if (!PLACES[placeId]) throw new Error(`Unknown journey place: ${placeId}`);

  return Object.freeze({
    placeId,
    episode: evidence.episode,
    depiction: "depicted",
    source: evidence.source,
  });
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function schematicPath(placeIds) {
  const points = placeIds.map((placeId) => PLACES[placeId]);
  const first = points[0];

  if (points.length === 1) {
    // Keep a measurable path for the animation without letting a stationary
    // season finish fractionally away from its only depicted location.
    return `M ${first.x} ${first.y} C ${first.x + 0.5} ${first.y + 0.5} ${first.x + 0.5} ${first.y - 0.5} ${first.x} ${first.y}`;
  }

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    const length = Math.max(Math.hypot(dx, dy), 1);
    const bend = Math.min(26, Math.max(7, length * 0.055)) * (index % 2 === 0 ? 1 : -1);
    const normalX = -dy / length;
    const normalY = dx / length;
    const controlOneX = previous.x + dx * 0.34 + normalX * bend;
    const controlOneY = previous.y + dy * 0.34 + normalY * bend;
    const controlTwoX = previous.x + dx * 0.68 + normalX * bend;
    const controlTwoY = previous.y + dy * 0.68 + normalY * bend;

    return `${path} C ${round(controlOneX)} ${round(controlOneY)} ${round(controlTwoX)} ${round(controlTwoY)} ${point.x} ${point.y}`;
  }, `M ${first.x} ${first.y}`);
}

const INITIAL_MOVE = /^\s*M\s+-?\d+(?:\.\d+)?[\s,]+-?\d+(?:\.\d+)?/i;

function pathWithContinuity(originPlaceId, item) {
  const firstDepictedPlaceId = item.stops[0].placeId;

  if (originPlaceId === firstDepictedPlaceId) return item.path;

  // Only the bridge is generated. Everything after the season's initial move
  // command remains the original hand-authored (or stop-derived) geometry.
  const bridge = schematicPath([originPlaceId, firstDepictedPlaceId]);
  const originalPathAfterMove = item.path.replace(INITIAL_MOVE, "").trim();

  return originalPathAfterMove ? `${bridge} ${originalPathAfterMove}` : bridge;
}

function cameraFor(placeIds) {
  const points = placeIds.map((placeId) => PLACES[placeId]);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spread = Math.max(maxX - minX, maxY - minY);
  const scale = spread > 800 ? 1.02 : spread > 550 ? 1.04 : spread > 350 ? 1.07 : spread > 180 ? 1.12 : 1.18;

  return Object.freeze({
    x: round((((minX + maxX) / 2) / JOURNEY_MAP.width) * 100),
    y: round((((minY + maxY) / 2) / JOURNEY_MAP.height) * 100),
    scale,
  });
}

function season({
  season: seasonNumber,
  title,
  summary,
  places,
  evidence,
  path,
  camera,
  duration,
}) {
  if (places.length !== evidence.length) {
    throw new Error(`Season ${seasonNumber} must provide evidence for every stop`);
  }

  return Object.freeze({
    season: seasonNumber,
    title,
    summary,
    stops: Object.freeze(places.map((placeId, index) => depicted(placeId, evidence[index]))),
    path: path ?? schematicPath(places),
    camera: camera ? Object.freeze(camera) : cameraFor(places),
    duration: duration ?? Math.min(4400, 3000 + Math.max(0, places.length - 1) * 350),
  });
}

function journey(characterSlug, characterName, seasons) {
  const continuousSeasons = seasons.map((item, index) => {
    if (index === 0) return item;

    const previousSeason = seasons[index - 1];
    const previousFinalStop = previousSeason.stops.at(-1);
    const firstDepictedStop = item.stops[0];
    const changesLocation = previousFinalStop.placeId !== firstDepictedStop.placeId;

    return Object.freeze({
      ...item,
      // A continuity origin is inherited from the prior season's final
      // source-backed stop. It is deliberately not added to `stops`, so the
      // current season's depicted locations and episode evidence stay exact.
      continuity: Object.freeze({
        originPlaceId: previousFinalStop.placeId,
        inheritedFromSeason: previousSeason.season,
        joinsFirstDepictedPlaceId: firstDepictedStop.placeId,
        kind: changesLocation ? "schematic-bridge" : "same-place",
      }),
      path: pathWithContinuity(previousFinalStop.placeId, item),
      // Include the inherited origin in the frame whenever a bridge is
      // necessary, otherwise its opening movement could begin off-screen.
      camera: changesLocation
        ? cameraFor([previousFinalStop.placeId, ...item.stops.map((stop) => stop.placeId)])
        : item.camera,
    });
  });

  return Object.freeze({
    key: `game-of-thrones/${characterSlug}`,
    seriesSlug: "game-of-thrones",
    seriesName: "Game of Thrones",
    characterSlug,
    characterName,
    totalSeasons: 8,
    seasons: Object.freeze(continuousSeasons),
  });
}

const daenerys = journey("daenerys-targaryen", "Daenerys Targaryen", [
  season({
    season: 1,
    title: "The birth of dragons",
    summary: "From an arranged marriage in Pentos, Daenerys became a khaleesi and emerged from Drogo's funeral pyre with three dragons.",
    places: ["pentos", "dothraki-sea", "vaes-dothrak", "lhazar"],
    evidence: [EPISODES.s1e1, EPISODES.s1e2, EPISODES.s1e4, EPISODES.s1e8],
    path: "M 735 486 C 820 438 900 420 975 430 S 1045 455 1090 468 S 1190 478 1250 525",
    camera: { x: 70, y: 47, scale: 1.08 },
    duration: 3400,
  }),
  season({
    season: 2,
    title: "Across the Red Waste",
    summary: "She led the remains of her khalasar through the Red Waste, entered Qarth, and reclaimed her dragons from the House of the Undying.",
    places: ["red-waste", "qarth"],
    evidence: [EPISODES.s2e1, EPISODES.s2e4],
    path: "M 1100 620 C 1145 690 1225 835 1270 915",
    camera: { x: 78, y: 66, scale: 1.1 },
    duration: 3400,
  }),
  season({
    season: 3,
    title: "Breaker of chains",
    summary: "Daenerys freed the Unsullied at Astapor, defeated Yunkai's defenders, and was welcomed by the people she liberated.",
    places: ["astapor", "yunkai"],
    evidence: [EPISODES.s3e1, EPISODES.s3e7],
    path: "M 980 775 C 1005 758 1030 748 1050 742",
    camera: { x: 74, y: 77, scale: 1.12 },
    duration: 3400,
  }),
  season({
    season: 4,
    title: "Queen of Meereen",
    summary: "She captured Meereen, answered its crucified children with justice, and chose to remain in Slaver's Bay to rule.",
    places: ["meereen"],
    evidence: [EPISODES.s4e3],
    camera: { x: 75, y: 69, scale: 1.18 },
    duration: 3000,
  }),
  season({
    season: 5,
    title: "Flight from the fighting pit",
    summary: "After unrest and the attack at Daznak's Pit, Drogon carried Daenerys away from Meereen into the Dothraki Sea.",
    places: ["meereen", "dothraki-sea-camp"],
    evidence: [EPISODES.s5e9, EPISODES.s5e10],
    path: "M 1135 730 C 1120 675 1095 625 1110 575",
    camera: { x: 75, y: 61, scale: 1.17 },
    duration: 3000,
  }),
  season({
    season: 6,
    title: "The fleet sails west",
    summary: "She united the Dothraki at Vaes Dothrak, returned to defend Meereen, and sailed for Westeros with her armies and dragons.",
    places: ["dothraki-sea-camp", "vaes-dothrak", "meereen"],
    evidence: [EPISODES.s6e1, EPISODES.s6e4, EPISODES.s6e9],
    path: "M 1110 575 C 1095 540 1085 500 1090 468 C 1100 550 1120 640 1135 730",
    camera: { x: 68, y: 65, scale: 1.05 },
    duration: 4200,
  }),
  season({
    season: 7,
    title: "The war for Westeros",
    summary: "Daenerys landed at Dragonstone, struck the Lannister army, rescued Jon beyond the Wall, and faced Cersei at the Dragonpit.",
    places: ["dragonstone", "roseroad", "dragonstone", "beyond-the-wall", "kings-landing"],
    evidence: [EPISODES.s7e1, EPISODES.s7e4, EPISODES.s7e5, EPISODES.s7e6, EPISODES.s7e7],
    path: "M 604 625 C 520 670 420 720 330 735 C 430 710 535 670 604 625 C 500 430 380 220 304 38 C 345 290 390 570 405 717",
    camera: { x: 32, y: 48, scale: 1.04 },
    duration: 4400,
  }),
  season({
    season: 8,
    title: "Fire at the end",
    summary: "She fought the dead at Winterfell, returned to Dragonstone, conquered King's Landing, and died beneath the Iron Throne.",
    places: ["winterfell", "dragonstone", "kings-landing"],
    evidence: [EPISODES.s8e1, EPISODES.s8e4, EPISODES.s8e5],
    path: "M 297 255 C 380 360 505 510 604 625 C 535 655 465 690 405 717",
    camera: { x: 31, y: 53, scale: 1.09 },
    duration: 3600,
  }),
]);

const jon = journey("jon-snow", "Jon Snow", [
  season({
    season: 1,
    title: "From Winterfell to the Wall",
    summary: "Jon left Winterfell, joined the Night's Watch at Castle Black, and chose his sworn brothers over desertion.",
    places: ["winterfell", "castle-black"],
    evidence: [EPISODES.s1e1, EPISODES.s1e3],
  }),
  season({
    season: 2,
    title: "The great ranging",
    summary: "North of the Wall, Jon ranged with the Night's Watch, spared Ygritte, and was taken into the free folk's custody.",
    places: ["beyond-the-wall"],
    evidence: [EPISODES.s2e2],
  }),
  season({
    season: 3,
    title: "Among the free folk",
    summary: "Jon travelled with the free folk beyond the Wall before escaping their company and returning wounded to Castle Black.",
    places: ["beyond-the-wall", "castle-black"],
    evidence: [EPISODES.s3e1, EPISODES.s3e10],
  }),
  season({
    season: 4,
    title: "The Wall under siege",
    summary: "From Castle Black, Jon led the raid on Craster's Keep and returned to defend the Wall against Mance Rayder's army.",
    places: ["castle-black", "crasters-keep", "castle-black"],
    evidence: [EPISODES.s4e1, EPISODES.s4e5, EPISODES.s4e9],
  }),
  season({
    season: 5,
    title: "Lord Commander",
    summary: "As Lord Commander, Jon sailed from Castle Black to Hardhome, rescued free folk, and returned to a fatal mutiny.",
    places: ["castle-black", "hardhome", "castle-black"],
    evidence: [EPISODES.s5e1, EPISODES.s5e8, EPISODES.s5e10],
  }),
  season({
    season: 6,
    title: "The battle for Winterfell",
    summary: "Resurrected at Castle Black, Jon left the Watch, defeated Ramsay Bolton, and was proclaimed King in the North at Winterfell.",
    places: ["castle-black", "winterfell"],
    evidence: [EPISODES.s6e2, EPISODES.s6e9],
  }),
  season({
    season: 7,
    title: "A king seeks an alliance",
    summary: "Jon left Winterfell for Dragonstone, led the mission from Eastwatch beyond the Wall, and joined the parley in King's Landing.",
    places: ["winterfell", "dragonstone", "eastwatch", "beyond-the-wall", "kings-landing"],
    evidence: [EPISODES.s7e1, EPISODES.s7e3, EPISODES.s7e5, EPISODES.s7e6, EPISODES.s7e7],
  }),
  season({
    season: 8,
    title: "The last watch",
    summary: "Jon fought at Winterfell, followed Daenerys to King's Landing, then returned through Castle Black to the lands beyond the Wall.",
    places: ["winterfell", "kings-landing", "castle-black", "beyond-the-wall"],
    evidence: [EPISODES.s8e1, EPISODES.s8e5, EPISODES.s8e6, EPISODES.s8e6],
  }),
]);

const cersei = journey("cersei-lannister", "Cersei Lannister", [
  season({
    season: 1,
    title: "The lion comes south",
    summary: "Cersei travelled with Robert's court from Winterfell to King's Landing, where her struggle with Ned Stark secured Joffrey's crown.",
    places: ["winterfell", "kings-landing"],
    evidence: [EPISODES.s1e1, EPISODES.s1e3],
  }),
  season({
    season: 2,
    title: "Holding the capital",
    summary: "Cersei remained in King's Landing through the War of the Five Kings and sheltered in the Red Keep during the Battle of Blackwater.",
    places: ["kings-landing"],
    evidence: [EPISODES.s2e9],
  }),
  season({
    season: 3,
    title: "Power behind the throne",
    summary: "In King's Landing, Cersei contended with the Tyrell alliance and Tywin's plan to marry her to secure the crown's position.",
    places: ["kings-landing"],
    evidence: [EPISODES.s3e1],
  }),
  season({
    season: 4,
    title: "A crown turns to mourning",
    summary: "Cersei stayed in King's Landing through Joffrey's death, Tyrion's trial, and the collapse of her father's control over the family.",
    places: ["kings-landing"],
    evidence: [EPISODES.s4e1],
  }),
  season({
    season: 5,
    title: "The walk of atonement",
    summary: "Cersei armed the Faith in King's Landing, was imprisoned by it, and returned to the Red Keep after her public walk of atonement.",
    places: ["kings-landing"],
    evidence: [EPISODES.s5e10],
  }),
  season({
    season: 6,
    title: "Queen of the Seven Kingdoms",
    summary: "Cersei destroyed the Great Sept in King's Landing and took the Iron Throne after Tommen's death.",
    places: ["kings-landing"],
    evidence: [EPISODES.s6e10],
  }),
  season({
    season: 7,
    title: "The Red Keep's war",
    summary: "From King's Landing, Cersei secured Euron's fleet, repaid the Iron Bank, and rejected the proposed truce against the dead.",
    places: ["kings-landing"],
    evidence: [EPISODES.s7e7],
  }),
  season({
    season: 8,
    title: "The fall of King's Landing",
    summary: "Cersei held the Red Keep until Daenerys burned King's Landing and the collapsing castle killed her beside Jaime.",
    places: ["kings-landing"],
    evidence: [EPISODES.s8e5],
  }),
]);

const arya = journey("arya-stark", "Arya Stark", [
  season({
    season: 1,
    title: "Needle on the road south",
    summary: "Arya left Winterfell with the royal party and trained with Syrio Forel after reaching King's Landing.",
    places: ["winterfell", "kings-landing"],
    evidence: [EPISODES.s1e1, EPISODES.s1e3],
  }),
  season({
    season: 2,
    title: "A prisoner on the Kingsroad",
    summary: "Disguised among recruits on the Kingsroad, Arya was captured by Lannister soldiers and taken to Harrenhal.",
    places: ["kingsroad", "harrenhal"],
    evidence: [EPISODES.s2e1, EPISODES.s2e4],
  }),
  season({
    season: 3,
    title: "Across the Riverlands",
    summary: "Arya crossed the Riverlands with the Brotherhood and the Hound, reaching the Twins as the Red Wedding unfolded.",
    places: ["riverlands", "the-twins"],
    evidence: [EPISODES.s3e2, EPISODES.s3e9],
  }),
  season({
    season: 4,
    title: "From the Riverlands to the sea",
    summary: "Arya and the Hound crossed the Riverlands and reached the Bloody Gate before Arya sailed from Saltpans for Braavos.",
    places: ["riverlands", "bloody-gate", "saltpans"],
    evidence: [EPISODES.s4e1, EPISODES.s4e8, EPISODES.s4e10],
  }),
  season({
    season: 5,
    title: "The House of Black and White",
    summary: "Arya arrived in Braavos and began the Faceless Men's training inside the House of Black and White.",
    places: ["braavos"],
    evidence: [EPISODES.s5e2],
  }),
  season({
    season: 6,
    title: "A girl returns to Westeros",
    summary: "Arya survived the Waif in Braavos, reclaimed her identity, and returned to Westeros to kill Walder Frey at the Twins.",
    places: ["braavos", "the-twins"],
    evidence: [EPISODES.s6e8, EPISODES.s6e10],
  }),
  season({
    season: 7,
    title: "Home to Winterfell",
    summary: "After taking revenge on House Frey at the Twins, Arya travelled north and returned to Winterfell.",
    places: ["the-twins", "winterfell"],
    evidence: [EPISODES.s7e1, EPISODES.s7e4],
  }),
  season({
    season: 8,
    title: "The long night and the last war",
    summary: "Arya defended Winterfell, killed the Night King, and survived Daenerys's destruction of King's Landing.",
    places: ["winterfell", "kings-landing"],
    evidence: [EPISODES.s8e1, EPISODES.s8e5],
  }),
]);

const tyrion = journey("tyrion-lannister", "Tyrion Lannister", [
  season({
    season: 1,
    title: "The long road from Winterfell",
    summary: "Tyrion visited Winterfell and Castle Black, returned south, survived trial at the Eyrie, and joined his father's army in the Riverlands.",
    places: ["winterfell", "castle-black", "winterfell", "eyrie", "riverlands"],
    evidence: [EPISODES.s1e1, EPISODES.s1e3, EPISODES.s1e4, EPISODES.s1e6, EPISODES.s1e9],
  }),
  season({
    season: 2,
    title: "Hand of the King",
    summary: "As acting Hand in King's Landing, Tyrion prepared the city's defenses and helped repel Stannis at the Blackwater.",
    places: ["kings-landing"],
    evidence: [EPISODES.s2e9],
  }),
  season({
    season: 3,
    title: "A lion in a gilded cage",
    summary: "Tyrion remained in King's Landing, lost political power to Tywin, and was forced into marriage with Sansa Stark.",
    places: ["kings-landing"],
    evidence: [EPISODES.s3e1],
  }),
  season({
    season: 4,
    title: "Trial and escape",
    summary: "Accused of Joffrey's murder in King's Landing, Tyrion survived trial by combat's verdict, killed Shae and Tywin, and escaped by sea.",
    places: ["kings-landing"],
    evidence: [EPISODES.s4e10],
  }),
  season({
    season: 5,
    title: "Across Essos",
    summary: "From Pentos, Tyrion travelled through Volantis and Valyria before slavery and chance brought him before Daenerys in Meereen.",
    places: ["pentos", "volantis", "valyria", "meereen"],
    evidence: [EPISODES.s5e1, EPISODES.s5e3, EPISODES.s5e5, EPISODES.s5e7],
  }),
  season({
    season: 6,
    title: "The queen's Hand",
    summary: "Tyrion governed Meereen during Daenerys's absence, helped defeat the slavers' fleet, and sailed west as Hand of the Queen.",
    places: ["meereen"],
    evidence: [EPISODES.s6e10],
  }),
  season({
    season: 7,
    title: "War counsel",
    summary: "Tyrion advised Daenerys from Dragonstone and travelled to King's Landing for the Dragonpit parley.",
    places: ["dragonstone", "kings-landing"],
    evidence: [EPISODES.s7e1, EPISODES.s7e7],
  }),
  season({
    season: 8,
    title: "A realm remade",
    summary: "Tyrion fought for the living at Winterfell, returned to Dragonstone, and faced the ruin of King's Landing before choosing a new king.",
    places: ["winterfell", "dragonstone", "kings-landing"],
    evidence: [EPISODES.s8e1, EPISODES.s8e4, EPISODES.s8e5],
  }),
]);

const brienne = journey("brienne-of-tarth", "Brienne of Tarth", [
  season({
    season: 2,
    title: "A new oath",
    summary: "Brienne won a place in Renly's guard near Storm's End, fled after his murder, and swore herself to Catelyn Stark before escorting Jaime south.",
    places: ["renlys-camp", "riverlands"],
    evidence: [EPISODES.s2e3, EPISODES.s2e8],
  }),
  season({
    season: 3,
    title: "The road with Jaime",
    summary: "Brienne crossed the Riverlands with Jaime, endured captivity at Harrenhal, and finally delivered him alive to King's Landing.",
    places: ["riverlands", "harrenhal", "kings-landing"],
    evidence: [EPISODES.s3e2, EPISODES.s3e5, EPISODES.s3e10],
  }),
  season({
    season: 4,
    title: "In search of the Stark girls",
    summary: "Brienne left King's Landing with Podrick, followed news through the Riverlands, and encountered Arya and the Hound in the Vale.",
    places: ["kings-landing", "riverlands", "vale"],
    evidence: [EPISODES.s4e1, EPISODES.s4e7, EPISODES.s4e10],
  }),
  season({
    season: 5,
    title: "A watch kept in the North",
    summary: "After finding Sansa in the Vale, Brienne followed her north and kept watch outside Winterfell, where she executed Stannis Baratheon.",
    places: ["vale", "winterfell"],
    evidence: [EPISODES.s5e1, EPISODES.s5e10],
  }),
  season({
    season: 6,
    title: "Sansa's sworn sword",
    summary: "Brienne brought Sansa safely to Castle Black, then rode south to seek the Blackfish's help at besieged Riverrun.",
    places: ["castle-black", "riverrun"],
    evidence: [EPISODES.s6e4, EPISODES.s6e8],
  }),
  season({
    season: 7,
    title: "The northern envoy",
    summary: "Brienne trained with Arya at Winterfell before representing Sansa at the Dragonpit gathering in King's Landing.",
    places: ["winterfell", "kings-landing"],
    evidence: [EPISODES.s7e4, EPISODES.s7e7],
  }),
  season({
    season: 8,
    title: "A knight of the Seven Kingdoms",
    summary: "Knighted at Winterfell, Brienne survived the Long Night and later served in King's Landing as Lord Commander of Bran's Kingsguard.",
    places: ["winterfell", "kings-landing"],
    evidence: [EPISODES.s8e1, EPISODES.s8e6],
  }),
]);

export const PUBLISHED_JOURNEYS = Object.freeze({
  [daenerys.key]: daenerys,
  [jon.key]: jon,
  [cersei.key]: cersei,
  [arya.key]: arya,
  [tyrion.key]: tyrion,
  [brienne.key]: brienne,
});

export const PUBLISHED_JOURNEY_KEYS = Object.freeze(Object.keys(PUBLISHED_JOURNEYS));

export function getJourney(seriesSlug, characterSlug) {
  return PUBLISHED_JOURNEYS[`${seriesSlug}/${characterSlug}`] ?? null;
}

export { JOURNEY_MAP, PLACES, getSeasonWaypoints } from "./places.js";
