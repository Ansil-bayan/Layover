---
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
