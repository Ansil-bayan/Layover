import { getCatalog } from "./okf";

export function haversine(a, b) {
  const radius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function travelMinutes(km) {
  if (km < 1.5) return Math.max(8, Math.round(km * 12));
  return Math.round(km * 3) + 6;
}

export function parseClock(value) {
  if (!value) return null;
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour)) return null;
  return hour * 60 + (minute || 0);
}

export function formatClock(minutes) {
  const day = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(day / 60);
  const minute = day % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function editsOf(booking) {
  return {
    extraShopIds: [],
    extraAmenityIds: [],
    removedIds: [],
    depart: null,
    end: null,
    ...(booking.itineraryEdits || {}),
  };
}

export function filterByPreference(places, preference) {
  if (!preference || preference === "everything") return places;
  const tags = new Map(getCatalog().sights.map((sight) => [sight.id, sight.tags]));
  return places.filter((place) => matchesPreference({ tags: tags.get(place.id) || "sightseeing" }, preference));
}

export function matchesPreference(sight, preference) {
  if (!preference || preference === "everything") return true;
  const tags = String(sight?.tags || "sightseeing")
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  return tags.includes(preference);
}

function nearestOrder(start, sights) {
  const pool = [...sights];
  const ordered = [];
  let cursor = start;
  while (pool.length) {
    pool.sort((a, b) => haversine(cursor, a) - haversine(cursor, b));
    const next = pool.shift();
    ordered.push(next);
    cursor = next;
  }
  return ordered;
}

function bestGap(route, shop) {
  let best = { index: route.length - 1, cost: Infinity };
  for (let i = 0; i < route.length - 1; i += 1) {
    const direct = haversine(route[i], route[i + 1]);
    const via = haversine(route[i], shop) + haversine(shop, route[i + 1]);
    const cost = via - direct;
    if (cost < best.cost) best = { index: i, cost };
  }
  return best.index;
}

export function resolveStay(booking) {
  const catalog = getCatalog();
  const edits = editsOf(booking);
  const booked = booking.hotel ? catalog.hotels.find((hotel) => hotel.id === booking.hotel.id) : null;
  const city = booked?.city || booking.travel?.city || booking.to;
  const area = (booking.travel?.stayWhere || "").toLowerCase();
  const standIn =
    catalog.hotels.find((hotel) => hotel.city === city && area && area.includes(hotel.area.toLowerCase())) ||
    catalog.hotels.find((hotel) => hotel.city === city) ||
    null;
  const hotel = booked || standIn;
  return { catalog, edits, hotel, city, booked: Boolean(booked) };
}

function insertStop(route, stop) {
  const index = bestGap(route, stop);
  route.splice(index + 1, 0, stop);
}

export function buildItinerary(booking, options = {}) {
  const { catalog, edits, hotel, city, booked } = resolveStay(booking);
  if (!hotel) return null;

  const removed = new Set(edits.removedIds);
  const preference = booking.travel?.preference || "everything";
  const sights = options.onlyAmenities
    ? []
    : nearestOrder(
        hotel,
        catalog.sights.filter(
          (sight) => sight.city === city && !removed.has(sight.id) && matchesPreference(sight, preference)
        )
      );
  const route = [{ ...hotel, kind: "hotel", hours: 0 }];
  sights.forEach((sight) => {
    route.push({ ...sight, kind: "sight" });
    catalog.shops
      .filter((shop) => shop.city === city && shop.on_route && shop.near === sight.id && !removed.has(shop.id))
      .forEach((shop) => route.push({ ...shop, kind: "shop", hours: 0.5 }));
  });

  const extras = options.onlyAmenities
    ? []
    : catalog.shops.filter(
        (shop) => shop.city === city && edits.extraShopIds.includes(shop.id) && !route.some((stop) => stop.id === shop.id)
      );
  extras.forEach((shop) => insertStop(route, { ...shop, kind: "shop", hours: 0.5 }));

  const wanted = new Set(booking.travel?.amenityIds || []);
  if (!options.onlyAmenities) edits.extraAmenityIds.forEach((id) => wanted.add(id));
  const includeAmenities =
    options.onlyAmenities || booking.travel?.amenityMode === "merge" || edits.extraAmenityIds.length > 0;
  if (includeAmenities) {
    catalog.amenities
      .filter((amenity) => amenity.city === city && wanted.has(amenity.id) && !removed.has(amenity.id))
      .filter((amenity) => !route.some((stop) => stop.id === amenity.id))
      .forEach((amenity) => insertStop(route, { ...amenity, kind: "amenity", hours: 0.75, blurb: amenity.note }));
  }

  const start = parseClock(edits.depart || booking.travel?.exploreFrom || "09:00");
  const end = parseClock(edits.end || booking.travel?.exploreTo || "19:00");
  let clock = start;
  const stops = [];
  const overflow = [];
  for (let i = 1; i < route.length; i += 1) {
    const previous = stops.length ? stops[stops.length - 1] : route[0];
    const place = route[i];
    const km = haversine(previous, place);
    const ride = travelMinutes(km);
    const arrive = clock + ride;
    const dwell = Math.round((place.hours || 0.5) * 60);
    const depart = arrive + dwell;
    const item = {
      ...place,
      fromName: previous.name,
      fromKind: previous.kind || "hotel",
      km: Math.round(km * 10) / 10,
      ride,
      leaveAt: formatClock(clock),
      arriveAt: formatClock(arrive),
      departAt: formatClock(depart),
      dwell,
    };
    if (depart <= end) {
      stops.push(item);
      clock = depart;
    } else {
      overflow.push(item);
    }
  }

  const scheduledIds = new Set(stops.map((stop) => stop.id));
  const offRoute = catalog.shops.filter(
    (shop) => shop.city === city && !shop.on_route && !scheduledIds.has(shop.id) && !edits.extraShopIds.includes(shop.id)
  );

  return {
    hotel,
    city,
    booked,
    leaveHotelAt: formatClock(start),
    endBy: formatClock(end),
    stops,
    overflow,
    offRoute,
    points: [route[0], ...stops],
    preference,
    onlyAmenities: Boolean(options.onlyAmenities),
  };
}

export function buildAmenityItinerary(booking) {
  const city = booking.travel?.amenityCity;
  const next = city
    ? {
        ...booking,
        travel: {
          ...booking.travel,
          city,
          stayWhere: booking.travel.amenityWhere || booking.travel.stayWhere,
        },
      }
    : booking;
  return buildItinerary(next, { onlyAmenities: true });
}
