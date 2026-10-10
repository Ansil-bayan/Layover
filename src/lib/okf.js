const files = import.meta.glob("../../okf/travelbuddy/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function conceptId(path) {
  const normalized = path.replaceAll("\\", "/");
  const marker = "okf/travelbuddy/";
  const start = normalized.indexOf(marker);
  const rel = start >= 0 ? normalized.slice(start + marker.length) : normalized;
  return rel.replace(/\.md$/, "");
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return { data: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return { data: {}, body: raw };
  const yaml = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s*\n/, "");
  const data = {};
  for (const line of yaml.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return { data, body };
}

function parseTables(body) {
  const sections = {};
  let heading = "";
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("#")) {
      heading = line.replace(/^#+\s*/, "").trim().toLowerCase();
      continue;
    }
    if (!line.startsWith("|") || !lines[i + 1]?.startsWith("|")) continue;
    const headers = splitRow(line);
    i += 2;
    const rows = [];
    for (; i < lines.length && lines[i].startsWith("|"); i += 1) {
      const cells = splitRow(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = cells[index] ?? "";
      });
      rows.push(row);
    }
    i -= 1;
    sections[heading] = rows;
  }
  return sections;
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildCatalog(entries) {
  const hotels = [];
  const sights = [];
  const shops = [];
  const amenities = [];
  const passages = [];

  entries.forEach(({ id, data, body }) => {
    if (id === "index" || id === "log" || id.endsWith("/index") || id.endsWith("/log")) return;
    const sections = parseTables(body);
    const city = data.title || "";
    (sections.hotels || []).forEach((row) => {
      hotels.push({
        id: row.id,
        city,
        name: row.name,
        area: row.area,
        price: num(row.price),
        lat: num(row.lat),
        lng: num(row.lng),
        concept: id,
      });
    });
    (sections.sights || []).forEach((row) => {
      sights.push({
        id: row.id,
        city,
        name: row.name,
        area: row.area,
        hours: num(row.hours),
        lat: num(row.lat),
        lng: num(row.lng),
        blurb: row.blurb,
        tags: row.tags || "sightseeing",
        concept: id,
      });
    });
    (sections.amenities || []).forEach((row) => {
      if (!row.id || !row.kind) return;
      amenities.push({
        id: row.id,
        city,
        name: row.name,
        kind: row.kind,
        area: row.area,
        lat: num(row.lat),
        lng: num(row.lng),
        note: row.note,
        concept: id,
      });
    });
    (sections["gift shops"] || []).forEach((row) => {
      shops.push({
        id: row.id,
        city,
        name: row.name,
        area: row.area,
        lat: num(row.lat),
        lng: num(row.lng),
        on_route: num(row.on_route),
        near: row.near,
        note: row.note,
        concept: id,
      });
    });

    const chunks = body
      .split(/\n(?=#)/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk && !chunk.startsWith("|"));
    chunks.forEach((chunk, index) => {
      passages.push({
        id: `${id}#${index}`,
        concept: id,
        title: data.title || id,
        type: data.type || "Concept",
        text: chunk.replace(/\|/g, " ").replace(/\s+/g, " ").slice(0, 900),
      });
    });
  });

  hotels.forEach((hotel) => {
    passages.push({
      id: `${hotel.concept}#hotel-${hotel.id}`,
      concept: hotel.concept,
      title: hotel.name,
      type: "Hotel",
      text: `${hotel.name} is a hotel in ${hotel.area}, ${hotel.city}. The nightly price is ${hotel.price} rupees. It stands at latitude ${hotel.lat} and longitude ${hotel.lng}. Routes leave from this hotel.`,
    });
  });
  sights.forEach((sight) => {
    passages.push({
      id: `${sight.concept}#sight-${sight.id}`,
      concept: sight.concept,
      title: sight.name,
      type: "Sight",
      text: `${sight.name} is in ${sight.area}, ${sight.city}. ${sight.blurb} Plan ${sight.hours} hours there. Preference tags: ${sight.tags}.`,
    });
  });
  amenities.forEach((amenity) => {
    passages.push({
      id: `${amenity.concept}#amenity-${amenity.id}`,
      concept: amenity.concept,
      title: amenity.name,
      type: "Amenity",
      text: `${amenity.name} is a ${amenity.kind === "currency" ? "currency exchange" : "local restaurant"} in ${amenity.area}, ${amenity.city}. ${amenity.note} It can sit inside the sightseeing itinerary or on an amenities-only itinerary.`,
    });
  });
  shops.forEach((shop) => {
    passages.push({
      id: `${shop.concept}#shop-${shop.id}`,
      concept: shop.concept,
      title: shop.name,
      type: "Gift Shop",
      text: `${shop.name} is a gift shop in ${shop.area}, ${shop.city}. ${shop.note} ${
        shop.on_route ? "It is already on the walking route." : "It is not on the walking route. Adding it is a detour."
      }`,
    });
  });

  return { hotels, sights, shops, amenities, passages, concepts: entries };
}

let cached;

export function getCatalog() {
  if (cached) return cached;
  const entries = Object.entries(files).map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    return { id: conceptId(path), data, body };
  });
  cached = buildCatalog(entries);
  return cached;
}
