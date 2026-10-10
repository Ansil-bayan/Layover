import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = join(import.meta.dirname, "..", "okf", "travelbuddy");

const cities = [
  {
    id: "kochi",
    title: "Kochi",
    hotels: [
      ["h1", "Harbour Line House", "Fort Kochi", 6400, 9.9665, 76.2422],
      ["h2", "Bungalow 18", "Fort Kochi", 9100, 9.9648, 76.2405],
      ["h3", "Ernakulam Station Hotel", "Ernakulam", 2800, 9.9689, 76.2893],
    ],
    sights: [
      ["nets", "Chinese Fishing Nets", "Fort Kochi", 1, 9.968, 76.2415, "Cantilevered nets on the waterfront. One lift of the net is the whole visit."],
      ["church", "St. Francis Church", "Fort Kochi", 1, 9.9656, 76.2412, "The oldest European church in India. Vasco da Gama was first buried here."],
      ["jew", "Jew Town and the synagogue lane", "Fort Kochi", 2, 9.9576, 76.2594, "Spice godowns and the synagogue at the end of the lane. Walk slowly."],
      ["marine", "Marine Drive", "Ernakulam", 1.5, 9.9684, 76.2768, "A paved walk facing the backwaters, best at dusk."],
      ["museum", "Hill Palace Museum", "Ernakulam", 2.5, 9.9528, 76.3629, "A royal museum in a park at Tripunithura. Read the labels and it takes the full time."],
    ],
    shops: [
      ["shop-cinnamon", "Cinnamon Souvenirs", "Fort Kochi", 9.9672, 76.243, 1, "nets", "On the promenade beside the nets. Spice packs, postcards, and small wood boats."],
      ["shop-edappally", "Edappally Keepsakes", "Edappally", 10.0261, 76.3081, 0, "marine", "A mall gift floor north of the fort walk. It is not on the sightseeing route unless you add the detour."],
    ],
  },
  {
    id: "bengaluru",
    title: "Bengaluru",
    hotels: [
      ["h4", "Cubbon Steps", "MG Road", 5400, 12.9756, 77.605],
      ["h5", "Indira Lane Rooms", "Indiranagar", 4700, 12.9784, 77.6408],
      ["h6", "Whitefield Halt", "Whitefield", 3900, 12.9698, 77.7499],
    ],
    sights: [
      ["cubbon", "Cubbon Park", "MG Road", 1.5, 12.9763, 77.5929, "Shaded lawns between the library and the museum."],
      ["churchst", "Church Street", "MG Road", 2, 12.9752, 77.6028, "Bookshops and small galleries. Two hours if you eat as well."],
      ["lalbagh", "Lalbagh", "MG Road", 2, 12.9507, 77.5848, "Glasshouse and the lake path. Morning is kinder than noon."],
      ["hundred", "100 Feet Road", "Indiranagar", 2, 12.978, 77.6405, "Cafes and a long pavement for wandering."],
      ["brew", "Indiranagar beer and book loop", "Indiranagar", 3, 12.9712, 77.6412, "Lanes off 12th Main. Three hours if a bookshop becomes a table."],
      ["phoenix", "Whitefield lakeside walk", "Whitefield", 1.5, 12.9692, 77.748, "A neighbourhood loop around the lake."],
    ],
    shops: [
      ["shop-commercial", "Commercial Street Gifts", "MG Road", 12.9822, 77.608, 1, "churchst", "On the walk from Church Street. Textiles, small idols, and tea tins."],
      ["shop-forum", "Forum Souvenir Hall", "Koramangala", 12.9349, 77.6112, 0, "lalbagh", "A mall hall south of Lalbagh. Off the MG Road walking route until you add it."],
    ],
  },
  {
    id: "chennai",
    title: "Chennai",
    hotels: [
      ["h7", "Tank Street Inn", "Mylapore", 4200, 13.0334, 80.2698],
      ["h8", "Shore Verandah", "Thiruvanmiyur", 6100, 12.9855, 80.2592],
      ["h9", "Parrys Rest", "Parrys", 3100, 13.0882, 80.2876],
    ],
    sights: [
      ["marina", "Marina Beach", "Mylapore", 1.5, 13.05, 80.2825, "A wide sandy walk. Ninety minutes and a snack."],
      ["kapaleeshwarar", "Kapaleeshwarar Temple tankside", "Mylapore", 1.5, 13.0336, 80.2707, "Gopuram, tank, and the flower market beside it."],
      ["sundar", "Kalakshetra grounds", "Thiruvanmiyur", 2, 12.989, 80.2584, "Banyan shade and craft studios by the beach road."],
      ["fort", "Fort St. George", "Parrys", 2, 13.0796, 80.2871, "Flags, portraits, and the city's colonial paperwork."],
    ],
    shops: [
      ["shop-mylapore", "Mylapore Craft Basket", "Mylapore", 13.0342, 80.2694, 1, "kapaleeshwarar", "On the tank street. Kanjivaram scraps, brass lamps, and postcards."],
      ["shop-express", "Express Avenue Gifts", "Royapettah", 13.0586, 80.2642, 0, "marina", "A mall counter between the beach and the fort. Not on the Mylapore walk unless you detour."],
    ],
  },
  {
    id: "hyderabad",
    title: "Hyderabad",
    hotels: [
      ["h10", "Laad Bazaar House", "Old City", 3800, 17.3612, 78.4744],
      ["h11", "Charminar Courtyard", "Old City", 5600, 17.3594, 78.4751],
      ["h12", "Banjara Lookout", "Banjara Hills", 7200, 17.4155, 78.4382],
    ],
    sights: [
      ["charminar", "Charminar and the Laad Bazaar", "Old City", 2.5, 17.3616, 78.4747, "The arch, then one bangle lane and tea."],
      ["chowmahalla", "Chowmahalla Palace", "Old City", 1.5, 17.3578, 78.4716, "Courtyards and chandeliers in a compact palace."],
      ["golconda", "Golconda Fort", "Banjara Hills", 3, 17.3833, 78.4011, "Gates and a clap that still carries. Carry water."],
      ["tankbund", "Tank Bund", "Banjara Hills", 1, 17.4239, 78.4738, "The lake edge and the Buddha statue. An hour of air."],
    ],
    shops: [
      ["shop-laad", "Laad Bazaar Bangles", "Old City", 17.361, 78.4755, 1, "charminar", "In the lanes off the arch. Bangles and itr bottles, on the old-city walk."],
      ["shop-banjara", "Banjara Gift Atelier", "Banjara Hills", 17.4192, 78.4484, 0, "tankbund", "A hill-road shop. It is off the Charminar walk until the itinerary detours."],
    ],
  },
  {
    id: "mysuru",
    title: "Mysuru",
    hotels: [
      ["h13", "Palace Road Rooms", "Centre", 4500, 12.3055, 76.6554],
      ["h14", "Market Gate Lodge", "Centre", 2900, 12.3112, 76.6534],
      ["h15", "Kukkarahalli Stay", "University", 3400, 12.3022, 76.6394],
    ],
    sights: [
      ["palace", "Mysuru Palace", "Centre", 2, 12.3052, 76.6552, "Main halls and the grounds. Queues grow on Sundays."],
      ["devaraja", "Devaraja Market", "Centre", 1.5, 12.3115, 76.653, "Flowers, banana leaves, and spice heaps under one roof."],
      ["chamundi", "Chamundi Hill", "Centre", 3, 12.2752, 76.6702, "Temple at the top and the view back over the city."],
      ["krs", "Kukkarahalli Lake", "University", 1.5, 12.302, 76.6382, "A shaded campus loop with birds."],
    ],
    shops: [
      ["shop-sandal", "Sandalwood Counter", "Centre", 12.3071, 76.6556, 1, "palace", "On Palace Road. Incense, sandal soap, and small inlay boxes."],
      ["shop-mall", "Mall of Mysore Souvenirs", "North", 12.3234, 76.6228, 0, "devaraja", "North of the market. Not on the palace-to-lake walk unless you add it."],
    ],
  },
  {
    id: "goa",
    title: "Goa",
    hotels: [
      ["h16", "Fontainhas Room", "Panaji", 5200, 15.4992, 73.8314],
      ["h17", "Mandovi Steps", "Panaji", 6800, 15.5014, 73.8276],
      ["h18", "Calangute Quarter", "Calangute", 5900, 15.5494, 73.7548],
    ],
    sights: [
      ["fontainhas", "Fontainhas", "Panaji", 1.5, 15.4995, 73.8315, "Painted houses and a small chapel. Ninety minutes with one coffee."],
      ["reis", "Reis Magos Fort", "Panaji", 2, 15.4964, 73.8092, "A river fort looking back toward the capital."],
      ["calangute", "Calangute beach walk", "Calangute", 2, 15.549, 73.7542, "A long sandy stretch. Two hours for a walk and a swim."],
      ["baga", "Baga creek at dusk", "Calangute", 1.5, 15.5554, 73.7518, "The creek mouth when the day boats come in."],
    ],
    shops: [
      ["shop-fontainhas", "Fontainhas Tile Shop", "Panaji", 15.4988, 73.8322, 1, "fontainhas", "Azulejo tiles and small saints, on the Latin-quarter lanes."],
      ["shop-mapusa", "Mapusa Friday Keepsakes", "Mapusa", 15.5916, 73.8094, 0, "reis", "The inland market. Off the Panaji fort walk until you detour inland."],
    ],
  },
  {
    id: "mangaluru",
    title: "Mangaluru",
    hotels: [
      ["h19", "Light House Lodge", "City", 2600, 12.8694, 74.8422],
      ["h20", "Hampankatta Rooms", "City", 2200, 12.8698, 74.8436],
      ["h21", "Panambur Bay Stay", "Panambur", 3400, 12.9294, 74.8142],
    ],
    sights: [
      ["light", "Lighthouse Hill", "City", 1.5, 12.8872, 74.8148, "A short climb for the harbour view."],
      ["kadri", "Kadri Manjunath Temple", "City", 1.5, 12.8886, 74.8558, "A temple tank and bronze history above the city."],
      ["panambur", "Panambur Beach", "Panambur", 2, 12.9372, 74.8064, "The city beach north of the port."],
    ],
    shops: [
      ["shop-hampan", "Hampankatta Spice Tins", "City", 12.8696, 74.8442, 1, "light", "On the city walk. Coffee, spice tins, and cashew packs."],
      ["shop-citycentre", "City Centre Mall Gifts", "City", 12.8724, 74.8568, 0, "kadri", "A mall counter east of Kadri. Not on the lighthouse walk unless you add it."],
    ],
  },
  {
    id: "coimbatore",
    title: "Coimbatore",
    hotels: [
      ["h22", "Town Hall Residency", "City", 3000, 11.0164, 76.9554],
      ["h23", "Perur Road Inn", "City", 2400, 10.9782, 76.9224],
      ["h24", "Ghat Foothill House", "Foothills", 4100, 11.0384, 76.8682],
    ],
    sights: [
      ["kovai", "Perur Pateeswarar Temple", "City", 1.5, 10.9754, 76.9126, "A large Shiva temple west of the city, with a quiet tank."],
      ["voc", "VOC Park", "City", 1, 11.0012, 76.9704, "A central park. An hour on the outer paths."],
      ["marudhamalai", "Marudhamalai", "Foothills", 3, 11.0462, 76.8524, "A hill temple on the way toward the ghats. The steps are the outing."],
    ],
    shops: [
      ["shop-townhall", "Town Hall Textiles", "City", 11.0168, 76.9562, 1, "voc", "On the park edge. Cotton, small bronze lamps."],
      ["shop-brookefields", "Brooke Fields Souvenirs", "City", 11.0092, 76.9598, 0, "kovai", "A mall hall. Off the Perur road unless the itinerary detours back into town."],
    ],
  },
];

const TAGS = {
  nets: "sightseeing popular",
  church: "historic spiritual",
  jew: "historic hidden",
  marine: "sightseeing popular",
  museum: "historic",
  cubbon: "sightseeing popular",
  churchst: "popular sightseeing",
  lalbagh: "sightseeing",
  hundred: "popular",
  brew: "hidden",
  phoenix: "hidden",
  marina: "popular sightseeing",
  kapaleeshwarar: "spiritual historic",
  sundar: "hidden",
  fort: "historic",
  charminar: "historic popular",
  chowmahalla: "historic",
  golconda: "historic popular",
  tankbund: "sightseeing",
  palace: "historic popular",
  devaraja: "popular sightseeing",
  chamundi: "spiritual historic",
  krs: "sightseeing hidden",
  fontainhas: "hidden historic",
  reis: "historic",
  calangute: "popular sightseeing",
  baga: "popular",
  light: "sightseeing",
  kadri: "spiritual historic",
  panambur: "popular sightseeing",
  kovai: "spiritual historic",
  voc: "sightseeing",
  marudhamalai: "spiritual historic",
};

function amenitiesFor(city) {
  const base = city.hotels[0];
  const area = base[2];
  const lat = base[4];
  const lng = base[5];
  return [
    [`fx-${city.id}`, `${city.title} Forex Desk`, "currency", area, lat + 0.012, lng + 0.01, `A currency exchange near ${area}. Bring a passport copy and the cash you want to change.`],
    [`eat-${city.id}`, `${area} Kitchen`, "restaurant", area, lat - 0.009, lng + 0.006, `A local restaurant in ${area} for a meal away from the hotel.`],
  ];
}

function table(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const rule = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return `${head}\n${rule}\n${body}`;
}

function write(rel, text) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

write(
  "index.md",
  `---
okf_version: "0.2"
title: TravelBuddy knowledge bundle
description: Hotels, sights, gift shops, and itinerary rules for Layover's TravelBuddy guide.
---

# TravelBuddy

This bundle is the only source the TravelBuddy guide retrieves from. Answers come from these concept documents, either by semantic passage search or by SQL over the tables they contain.

## Cities

${cities.map((city) => `- [${city.title}](/cities/${city.id}.md)`).join("\n")}

## How to use this bundle

- [Itinerary rules](/playbooks/itinerary-rules.md) explain depart times, distances, and detours.
- [Gift shops](/playbooks/gift-shops.md) explain which counters sit on a walking route and which are a detour.
- [Catalog schema](/schema/travel-catalog.md) is the SQL shape of hotels, sights, and shops.
`
);

write(
  "log.md",
  `# Log

## 2026-10-10

- Added city guides for Kochi, Bengaluru, Chennai, Hyderabad, Mysuru, Goa, Mangaluru, and Coimbatore.
- Marked one gift shop on each city's walking route and one shop that requires a detour.
- Recorded itinerary timing rules: hotel departure, leg distance, and dwell.
`
);

write(
  "playbooks/itinerary-rules.md",
  `---
type: Playbook
title: Itinerary timing rules
description: How TravelBuddy turns a hotel and a set of sights into depart times.
resource: layover://playbooks/itinerary-rules
tags: [itinerary, depart, distance, time]
status: stable
generated: { by: human:layover, at: 2026-10-10T09:00:00Z }
verified: { by: human:layover, at: 2026-10-10T09:00:00Z }
---

# Rules

Leave the booked hotel at the start of the explore window. If the traveller did not set one, leave at 09:00.

Order the sights by shortest leg from the current point, starting at the hotel. That is the route.

Distance is the straight-line kilometres between the previous stop and the next. Under 1.5 km, travel time is 12 minutes per kilometre on foot. At 1.5 km or more, travel time is 3 minutes per kilometre by cab, plus 6 minutes to find the cab.

Dwell at a sight is that sight's hours. Dwell at a gift shop is 30 minutes.

The depart time from a stop is the arrival time plus the dwell. The next leg leaves at that depart time.

A sight that would arrive after the end of the explore window is not possible today. The default end is 19:00 when the traveller did not set one.

The map on the site draws this route. The downloadable PDF lists the same depart times and distances and does not include the map.

# Examples

A traveller at Harbour Line House with a 09:00 start walks to the Chinese Fishing Nets first, because that sight is the closest. They leave the hotel at 09:00.
`
);

write(
  "playbooks/gift-shops.md",
  `---
type: Playbook
title: Gift shops on and off the route
description: When a souvenir stop is already on the walk, and when adding one rewrites the itinerary.
resource: layover://playbooks/gift-shops
tags: [gift, souvenir, shop, detour, route]
status: stable
generated: { by: human:layover, at: 2026-10-10T09:00:00Z }
verified: { by: human:layover, at: 2026-10-10T09:00:00Z }
---

# On the route

A gift shop with on_route 1 sits beside the sight named in its near column. The itinerary inserts that shop after that sight. The traveller does not have to ask.

These shops sell souvenirs: spice packs, textiles, bangles, sandalwood, tiles, postcards, and small idols. Thirty minutes is enough.

# Off the route

A gift shop with on_route 0 is not on the walking route. Suggest it, and leave it off the line until the traveller asks to add it.

When they ask to include that souvenir shop, insert it at the point in the route where the detour kilometres are smallest, then rebuild every later depart time. Tell them the new leave-time from the previous stop and the distance of the detour.

# Examples

Edappally Keepsakes in Kochi is off the Fort Kochi walk. Cinnamon Souvenirs is on it, beside the fishing nets. Asking to add Edappally Keepsakes modifies the itinerary.
`
);

write(
  "schema/travel-catalog.md",
  `---
type: Reference
title: Travel catalog schema
description: SQL tables built from the city guides for structured questions.
resource: layover://schema/travel-catalog
tags: [sql, schema, hotels, sights, shops]
status: stable
generated: { by: human:layover, at: 2026-10-10T09:00:00Z }
verified: { by: human:layover, at: 2026-10-10T09:00:00Z }
---

# Schema

## hotels

| column | type | description |
| --- | --- | --- |
| id | TEXT | Hotel id, shared with the booking catalog. |
| city | TEXT | City name. |
| name | TEXT | Hotel name. |
| area | TEXT | Neighbourhood. |
| price | INT | Nightly price in INR. |
| lat | REAL | Latitude. |
| lng | REAL | Longitude. |

## sights

| column | type | description |
| --- | --- | --- |
| id | TEXT | Sight id. |
| city | TEXT | City name. |
| name | TEXT | Sight name. |
| area | TEXT | Neighbourhood. |
| hours | REAL | Hours the stop needs. |
| lat | REAL | Latitude. |
| lng | REAL | Longitude. |
| blurb | TEXT | What the stop is. |
| tags | TEXT | spiritual, hidden, sightseeing, popular, historic. A sight can carry more than one. |

## shops

| column | type | description |
| --- | --- | --- |
| id | TEXT | Shop id. |
| city | TEXT | City name. |
| name | TEXT | Shop name. |
| area | TEXT | Neighbourhood. |
| lat | REAL | Latitude. |
| lng | REAL | Longitude. |
| on_route | INT | 1 if the shop is already on the walking route, else 0. |
| near | TEXT | Sight id the shop belongs beside. |
| note | TEXT | What it sells and whether it is a detour. |

# Examples

\`\`\`sql
SELECT name, area, price FROM hotels WHERE city = 'Kochi';
SELECT name, hours FROM sights WHERE city = 'Kochi';
SELECT name, on_route, note FROM shops WHERE city = 'Kochi' AND on_route = 0;
\`\`\`

The sights table also has a tags column. A tag is one of spiritual, hidden, sightseeing, popular, or historic. An itinerary that asks for everything keeps every sight. Any other preference keeps sights whose tags include that word.

## amenities

| column | type | description |
| --- | --- | --- |
| id | TEXT | Amenity id. |
| name | TEXT | Place name. |
| kind | TEXT | currency or restaurant. |
| area | TEXT | Neighbourhood. |
| lat | REAL | Latitude. |
| lng | REAL | Longitude. |
| note | TEXT | What the stop is for. |

Use hotels for room prices and the start of the route. Use sights for what can be covered and how long each stop takes. Use shops to tell an on-route souvenir counter from a detour. Use amenities for a currency exchange or a local restaurant, either folded into the sightseeing day or written as their own itinerary.
`
);

for (const city of cities) {
  const hotelTable = table(
    ["id", "name", "area", "price", "lat", "lng"],
    city.hotels.map((row) => row.map(String))
  );
  const sightTable = table(
    ["id", "name", "area", "hours", "lat", "lng", "blurb", "tags"],
    city.sights.map((row) => [...row.map(String), TAGS[row[0]] || "sightseeing"])
  );
  const amenityRows = amenitiesFor(city);
  const amenityTable = table(
    ["id", "name", "kind", "area", "lat", "lng", "note"],
    amenityRows.map((row) => row.map(String))
  );
  const shopTable = table(
    ["id", "name", "area", "lat", "lng", "on_route", "near", "note"],
    city.shops.map((row) => row.map(String))
  );
  const notes = city.sights
    .map((row) => `### ${row[1]}\n\n${row[6]} It takes ${row[3]} hours in ${row[2]}.`)
    .join("\n\n");
  const shopNotes = city.shops
    .map((row) => `### ${row[1]}\n\n${row[7]}`)
    .join("\n\n");
  const amenityNotes = amenityRows
    .map((row) => `### ${row[1]}\n\n${row[6]}`)
    .join("\n\n");
  write(
    `cities/${city.id}.md`,
    `---
type: City Guide
title: ${city.title}
description: Hotels, sights, and gift shops for a ${city.title} layover.
resource: layover://cities/${city.id}
tags: [${city.id}, hotels, sights, gifts, souvenirs]
status: stable
generated: { by: human:layover, at: 2026-10-10T09:00:00Z }
verified: { by: human:layover, at: 2026-10-10T09:00:00Z }
---

# Hotels

${hotelTable}

# Sights

${sightTable}

# Gift shops

${shopTable}

# Amenities

${amenityTable}

# Walk notes

${notes}

# Souvenir notes

${shopNotes}

# Amenity notes

${amenityNotes}

See the [itinerary rules](/playbooks/itinerary-rules.md) for depart times and the [gift shop playbook](/playbooks/gift-shops.md) for detours.
`
  );
}

console.log("Wrote OKF bundle at", root);
