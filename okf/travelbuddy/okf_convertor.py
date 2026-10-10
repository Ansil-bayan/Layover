from pathlib import Path

# Kochi tourist spots data source
spots_data = [
    {
        "spot_id": "mattancherry_palace",
        "name": "Mattancherry Palace (Dutch Palace)",
        "category": "Heritage Museum",
        "opening_time": "10:00 AM",
        "closing_time": "05:00 PM",
        "closed_days": ["Friday"],
        "location": "Mattancherry, Kochi",
        "description": "A historical palace featuring Kerala murals and portraits of the Rajas of Cochin."
    },
    {
        "spot_id": "paradesi_synagogue",
        "name": "Paradesi Synagogue",
        "category": "Historical Site",
        "opening_time": "10:00 AM",
        "closing_time": "05:00 PM",
        "closed_days": ["Friday", "Saturday", "Jewish Holidays"],
        "location": "Jew Town, Mattancherry",
        "description": "The oldest active synagogue in the Commonwealth of Nations, located in Jew Town."
    },
    {
        "spot_id": "hill_palace_museum",
        "name": "Hill Palace Museum",
        "category": "Ethno-Archaeological Museum",
        "opening_time": "09:00 AM",
        "closing_time": "04:30 PM",
        "closed_days": ["Monday"],
        "location": "Tripunithura, Kochi",
        "description": "Kerala's largest archaeological museum showcasing royal heritage and artifacts."
    },
    {
        "spot_id": "st_francis_church",
        "name": "St. Francis CSI Church",
        "category": "Historic Church",
        "opening_time": "07:00 AM",
        "closing_time": "06:30 PM",
        "closed_days": [],
        "location": "Fort Kochi",
        "description": "The oldest European church in India, originally built in 1503."
    },
    {
        "spot_id": "kerala_folklore_museum",
        "name": "Kerala Folklore Museum",
        "category": "Cultural Museum",
        "opening_time": "09:30 AM",
        "closing_time": "06:00 PM",
        "closed_days": [],
        "location": "Thevara, Kochi",
        "description": "A three-story architectural marvel housing thousands of artifacts representing Kerala culture."
    },
    {
        "spot_id": "chinese_fishing_nets",
        "name": "Chinese Fishing Nets & Vasco da Gama Square",
        "category": "Landmark",
        "opening_time": "Open 24 hours",
        "closing_time": "Open 24 hours",
        "closed_days": [],
        "location": "Fort Kochi waterfront",
        "description": "Iconic fixed land installations for fishing along the scenic Fort Kochi waterfront."
    }
]

def generate_okf_bundle(output_dir="knowledge/tourist_spots"):
    root = Path(output_dir)
    root.mkdir(parents=True, exist_ok=True)
    
    # Initialize index.md (progressive disclosure manifest)
    index_lines = [
        "---\ntype: Index",
        "title: Kochi Tourist Spots",
        "description: Authoritative directory of tourist locations and operating hours in Kochi.",
        "tags: [kochi, tourism, geography]",
        "---\n",
        "# Kochi Tourist Spots Directory\n",
        "Explore structured details and operating hours for heritage sites and landmarks in Kochi.\n",
        "## Available Concepts"
    ]

    for spot in spots_data:
        file_path = root / f"{spot['spot_id']}.md"
        closed_str = ", ".join(spot["closed_days"]) if spot["closed_days"] else "None (Open Daily)"
        
        # OKF Concept Document format: YAML frontmatter + Markdown body
        content = f"""---
type: Tourist Spot
title: {spot['name']}
description: {spot['description']}
resource: kochi://spots/{spot['spot_id']}
tags: [kochi, tourism, {spot['category'].lower().replace(' ', '_')}]
---

# {spot['name']}

**Category:** {spot['category']}  
**Location:** {spot['location']}  

## Operating Hours
* **Opening Time:** {spot['opening_time']}
* **Closing Time:** {spot['closing_time']}
* **Closed Days:** {closed_str}

## Overview
{spot['description']}
"""
        file_path.write_text(content, encoding="utf-8")
        index_lines.append(f"- [{spot['name']}](./{spot['spot_id']}.md) — {spot['category']}")
        print(f"✔ Generated concept: {file_path}")

    # Write the root index manifest
    (root / "index.md").write_text("\n".join(index_lines), encoding="utf-8")
    print(f"✔ Generated bundle manifest at {root / 'index.md'}")

if __name__ == "__main__":
    generate_okf_bundle()