import { CITIES } from "../data/content";
import { getCatalog } from "./okf";

export function resolvePlace(text) {
  const query = text.trim().toLowerCase();
  if (!query) return null;
  const named = CITIES.find((name) => query.includes(name.toLowerCase()));
  if (named) return { city: named, label: text.trim() };
  const hotel = getCatalog().hotels.find(
    (item) => query.includes(item.name.toLowerCase()) || query.includes(item.area.toLowerCase())
  );
  if (hotel) return { city: hotel.city, label: text.trim() };
  return null;
}
