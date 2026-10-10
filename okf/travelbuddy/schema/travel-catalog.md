---
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

```sql
SELECT name, area, price FROM hotels WHERE city = 'Kochi';
SELECT name, hours FROM sights WHERE city = 'Kochi';
SELECT name, on_route, note FROM shops WHERE city = 'Kochi' AND on_route = 0;
```

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
