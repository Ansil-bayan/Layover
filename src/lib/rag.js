import alasql from "alasql";
import { getCatalog } from "./okf";
import { buildItinerary } from "./itinerary";

const STOP = new Set("the a an of to and in on for from with at by is are was be it this that your you we our or if so as".split(" "));

const SYNONYMS = {
  souvenir: ["gift", "shop", "memento", "keepsake"],
  souvenirs: ["gift", "shop", "memento"],
  gift: ["souvenir", "shop"],
  shop: ["souvenir", "gift"],
  detour: ["route", "off", "modify", "itinerary"],
  route: ["itinerary", "walk", "path", "map"],
  itinerary: ["route", "plan", "depart", "leave"],
  leave: ["depart", "departure", "start"],
  depart: ["leave", "departure"],
  hotel: ["room", "stay", "accommodation"],
  room: ["hotel", "stay", "price"],
  far: ["distance", "km", "kilometre"],
  distance: ["km", "far", "leg"],
  time: ["depart", "leave", "arrive", "hours"],
  sight: ["spot", "place", "visit"],
  spot: ["sight", "place"],
  currency: ["exchange", "forex", "amenity"],
  exchange: ["currency", "forex", "amenity"],
  restaurant: ["food", "meal", "amenity"],
  amenity: ["currency", "restaurant", "exchange"],
  spiritual: ["temple", "church", "shrine"],
  historic: ["landmark", "palace", "fort"],
  hidden: ["quiet", "neighbourhood"],
};

let ready = false;

function ensureSql() {
  if (ready) return;
  const { hotels, sights, shops, amenities } = getCatalog();
  ["hotels", "sights", "shops", "amenities"].forEach((name) => {
    try {
      alasql(`DROP TABLE ${name}`);
    } catch {
      /* table may not exist on the first run */
    }
  });
  alasql(
    "CREATE TABLE hotels (id STRING, city STRING, name STRING, area STRING, price INT, lat NUMBER, lng NUMBER, concept STRING)"
  );
  alasql(
    "CREATE TABLE sights (id STRING, city STRING, name STRING, area STRING, hours NUMBER, lat NUMBER, lng NUMBER, blurb STRING, tags STRING, concept STRING)"
  );
  alasql(
    "CREATE TABLE shops (id STRING, city STRING, name STRING, area STRING, lat NUMBER, lng NUMBER, on_route INT, near STRING, note STRING, concept STRING)"
  );
  alasql(
    "CREATE TABLE amenities (id STRING, city STRING, name STRING, kind STRING, area STRING, lat NUMBER, lng NUMBER, note STRING, concept STRING)"
  );
  hotels.forEach((row) => alasql("INSERT INTO hotels VALUES (?,?,?,?,?,?,?,?)", Object.values(row)));
  sights.forEach((row) => alasql("INSERT INTO sights VALUES (?,?,?,?,?,?,?,?,?,?)", Object.values(row)));
  shops.forEach((row) => alasql("INSERT INTO shops VALUES (?,?,?,?,?,?,?,?,?,?)", Object.values(row)));
  amenities.forEach((row) => alasql("INSERT INTO amenities VALUES (?,?,?,?,?,?,?,?,?)", Object.values(row)));
  ready = true;
}

function showSql(sql, params) {
  let index = 0;
  return sql.replace(/\?/g, () => {
    const value = params[index];
    index += 1;
    return typeof value === "number" ? String(value) : `'${String(value).replaceAll("'", "''")}'`;
  });
}

function tokens(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

function embed(text) {
  const vector = new Map();
  const words = tokens(text);
  words.forEach((word, index) => {
    const expanded = [word, ...(SYNONYMS[word] || [])];
    expanded.forEach((token) => vector.set(token, (vector.get(token) || 0) + 1));
    const next = words[index + 1];
    if (next) vector.set(`${word}_${next}`, (vector.get(`${word}_${next}`) || 0) + 1.4);
  });
  return vector;
}

function cosine(left, right) {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  left.forEach((value, key) => {
    leftNorm += value * value;
    if (right.has(key)) dot += value * right.get(key);
  });
  right.forEach((value) => {
    rightNorm += value * value;
  });
  const denom = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
  return denom ? dot / denom : 0;
}

function semanticSearch(question, limit = 4, city = "") {
  const query = embed(question);
  const place = city.toLowerCase();
  const ranked = getCatalog()
    .passages.map((passage) => ({ ...passage, score: cosine(query, embed(`${passage.title} ${passage.text}`)) }))
    .filter((passage) => passage.score > 0.08)
    .sort((a, b) => b.score - a.score);
  const local = place
    ? ranked.filter((passage) => `${passage.concept} ${passage.text}`.toLowerCase().includes(place))
    : ranked;
  return (local.length ? local : ranked).slice(0, limit);
}

function clockFromMatch(match) {
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = (match[3] || "").toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function consultGuide(question, booking, options = {}) {
  ensureSql();
  const plan = buildItinerary(booking);
  const city = options.city || plan?.city || booking.to;
  const lower = question.toLowerCase();
  const queries = [];

  const run = (sql, params) => {
    const rows = alasql(sql, params);
    queries.push({ sql: showSql(sql, params), rows });
    return rows;
  };

  if (/hotel|room|price|stay|book/.test(lower)) {
    run("SELECT id, name, area, price FROM hotels WHERE city = ?", [city]);
  }
  if (/sight|spot|visit|see|palace|fort|beach|temple|park|market|museum|church/.test(lower) || /what can i|where should/.test(lower)) {
    run("SELECT id, name, area, hours, blurb FROM sights WHERE city = ?", [city]);
  }
  if (/gift|souvenir|shop|keepsake|bangle|spice/.test(lower) || /not on the route|detour/.test(lower)) {
    run("SELECT id, name, area, on_route, near, note FROM shops WHERE city = ?", [city]);
  }
  if (/amenit|currency|exchange|forex|restaurant|food|meal|eat/.test(lower)) {
    run("SELECT id, name, kind, area, note FROM amenities WHERE city = ?", [city]);
  }
  if (/spiritual|temple|church|hidden|sightseeing|popular|historic|landmark|everything/.test(lower)) {
    run("SELECT id, name, area, hours, tags, blurb FROM sights WHERE city = ?", [city]);
  }
  if (/how far|distance|km|when|leave|depart|time|itinerary|route/.test(lower)) {
    run("SELECT id, name, hours, area FROM sights WHERE city = ?", [city]);
  }
  if (!queries.length) {
    run("SELECT id, name, area, hours, tags FROM sights WHERE city = ?", [city]);
    run("SELECT id, name, on_route FROM shops WHERE city = ?", [city]);
    run("SELECT id, name, kind, note FROM amenities WHERE city = ?", [city]);
  }

  const semantic = semanticSearch(question, 4, city);
  const actions = [];
  const shops = alasql("SELECT id, name, on_route, note FROM shops WHERE city = ?", [city]);
  const sights = alasql("SELECT id, name FROM sights WHERE city = ?", [city]);
  const amenities = alasql("SELECT id, name, kind FROM amenities WHERE city = ?", [city]);

  if (/(add|include|insert|detour|put|modify|change)/.test(lower) && /(gift|souvenir|shop|keepsake)/.test(lower)) {
    const named = shops.find((shop) => lower.includes(String(shop.name).toLowerCase()));
    const off = shops.filter((shop) => !shop.on_route);
    const shop = named || off.find((item) => !(booking.itineraryEdits?.extraShopIds || []).includes(item.id)) || off[0];
    if (shop) actions.push({ type: "add_shop", id: shop.id, name: shop.name });
  }
  if (/(add|include|insert|update|cover)/.test(lower) && /(amenit|currency|exchange|forex|restaurant|food)/.test(lower)) {
    const named = amenities.find((amenity) => lower.includes(String(amenity.name).toLowerCase()));
    const kind = /currency|exchange|forex/.test(lower) ? "currency" : /restaurant|food|meal/.test(lower) ? "restaurant" : null;
    const amenity = named || amenities.find((item) => item.kind === kind) || amenities[0];
    if (amenity) actions.push({ type: "add_amenity", id: amenity.id, name: amenity.name });
  }
  if (/(remove|drop|skip)/.test(lower)) {
    const named = [...sights, ...shops].find((row) => lower.includes(String(row.name).toLowerCase().slice(0, 6)));
    if (named) actions.push({ type: "remove_stop", id: named.id, name: named.name });
  }
  const until = question.match(/\buntil\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  const leave = question.match(/\b(?:leave|depart|start)\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (until) actions.push({ type: "set_end", time: clockFromMatch(until) });
  else if (leave) actions.push({ type: "set_depart", time: clockFromMatch(leave) });

  return { queries, semantic, actions, city };
}

export function applyGuideActions(edits, actions) {
  const next = {
    extraShopIds: [...(edits.extraShopIds || [])],
    extraAmenityIds: [...(edits.extraAmenityIds || [])],
    removedIds: [...(edits.removedIds || [])],
    depart: edits.depart || null,
    end: edits.end || null,
  };
  actions.forEach((action) => {
    if (action.type === "add_shop" && !next.extraShopIds.includes(action.id)) next.extraShopIds.push(action.id);
    if (action.type === "add_amenity" && !next.extraAmenityIds.includes(action.id)) next.extraAmenityIds.push(action.id);
    if (action.type === "remove_stop" && !next.removedIds.includes(action.id)) next.removedIds.push(action.id);
    if (action.type === "set_depart") next.depart = action.time;
    if (action.type === "set_end") next.end = action.time;
  });
  return next;
}

function retrievalBrief({ question, retrieval, itinerary, actions }) {
  const sql = retrieval.queries
    .map((query) => {
      const rows = query.rows
        .slice(0, 8)
        .map((row) => Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(", "))
        .join("\n");
      return `Query: ${query.sql}\n${rows || "No rows."}`;
    })
    .join("\n\n");
  const passages = retrieval.semantic
    .map((passage) => `${passage.title} (${passage.concept}): ${passage.text}`)
    .join("\n\n");
  const stops = itinerary
    ? itinerary.stops
        .map(
          (stop) =>
            `Leave ${stop.fromName} at ${stop.leaveAt}. ${stop.name} is ${stop.km} km, about ${stop.ride} minutes. Arrive ${stop.arriveAt}, stay ${stop.dwell} minutes, leave at ${stop.departAt}. ${stop.blurb || stop.note || ""}`
        )
        .join("\n")
    : "No itinerary.";
  const overflow = itinerary?.overflow?.length
    ? itinerary.overflow
        .map((stop) => `${stop.name} is ${stop.km} km from ${stop.fromName} and does not fit before ${itinerary.endBy}.`)
        .join("\n")
    : "None.";
  const offRoute = itinerary?.offRoute?.length
    ? itinerary.offRoute.map((shop) => `${shop.name} in ${shop.area}. ${shop.note}`).join("\n")
    : "None.";
  const changes = actions.length
    ? actions.map((action) => `${action.type.replaceAll("_", " ")} ${action.name || action.time}`).join("; ")
    : "None.";

  return `City: ${retrieval.city}
Traveller question: ${question}

Retrieved rows from the OKF catalog:
${sql}

Retrieved passages from the OKF documents:
${passages || "None."}

Itinerary:
Leave ${itinerary?.hotel?.name || "the hotel"} at ${itinerary?.leaveHotelAt || "09:00"}. Finish the walk by ${itinerary?.endBy || "19:00"}.
${stops}
Beyond the window:
${overflow}
Gift shops still off the route:
${offRoute}

Changes already applied to the plan: ${changes}

Write the reply the traveller should read.`;
}

export async function replyFromGuide(input) {
  try {
    const response = await fetch("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: retrievalBrief(input) }),
    });
    const payload = await response.json();
    if (payload.text) return payload.text.trim();
    if (payload.error) return payload.error;
    return composeGuideAnswer(input);
  } catch {
    return composeGuideAnswer(input);
  }
}

export function composeGuideAnswer({ question, retrieval, itinerary, actions }) {
  const lines = [];
  lines.push(`I read the TravelBuddy OKF bundle for ${retrieval.city}, using SQL and a semantic search over the same documents.`);
  retrieval.queries.forEach((query) => {
    const preview = query.rows
      .slice(0, 4)
      .map((row) => Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(", "))
      .join("; ");
    lines.push(`SQL ${query.sql} returned ${query.rows.length} row${query.rows.length === 1 ? "" : "s"}. ${preview}`);
  });
  if (retrieval.semantic.length) {
    const top = retrieval.semantic[0];
    lines.push(`Semantic match ${top.title} (${top.concept}, score ${top.score.toFixed(2)}): ${top.text.slice(0, 280)}`);
  } else {
    lines.push("Semantic search did not find a close passage. The SQL rows are the whole answer.");
  }

  if (itinerary) {
    lines.push(`Leave ${itinerary.hotel.name} at ${itinerary.leaveHotelAt}. Be back from the walk by ${itinerary.endBy}.`);
    itinerary.stops.slice(0, 6).forEach((stop) => {
      lines.push(
        `Leave ${stop.fromName} at ${stop.leaveAt}. ${stop.name} is ${stop.km} km, about ${stop.ride} minutes. Arrive ${stop.arriveAt}, stay ${stop.dwell} minutes, leave at ${stop.departAt}.`
      );
    });
    if (itinerary.overflow.length) {
      lines.push(
        `Beyond today's window: ${itinerary.overflow.map((stop) => `${stop.name} (${stop.km} km from ${stop.fromName})`).join("; ")}.`
      );
    }
    if (itinerary.offRoute.length) {
      lines.push(
        `Gift shops not on this route: ${itinerary.offRoute.map((shop) => shop.name).join(", ")}. Ask me to add one and I will rebuild the depart times.`
      );
    }
  }

  if (actions.length) {
    lines.push(`I changed the plan: ${actions.map((action) => `${action.type.replaceAll("_", " ")} ${action.name || action.time}`).join("; ")}. The times above are the rebuilt itinerary.`);
  } else if (/add|detour|souvenir|gift/.test(question.toLowerCase()) && itinerary?.offRoute.length) {
    lines.push("Say which off-route shop to add, for example: add the gift shop that is not on the route.");
  }

  return lines.join("\n\n");
}
