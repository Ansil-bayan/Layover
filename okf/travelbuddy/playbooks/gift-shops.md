---
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
