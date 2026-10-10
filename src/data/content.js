export const CITIES = [
  "Bengaluru",
  "Kochi",
  "Chennai",
  "Hyderabad",
  "Mysuru",
  "Goa",
  "Mangaluru",
  "Coimbatore",
];

export const INTERESTS = [
  "Music",
  "Food",
  "Books",
  "Films",
  "Startups",
  "Trekking",
  "Photography",
  "History",
  "Tech",
  "Art",
  "Cricket",
  "Coffee",
  "Philosophy",
  "Regional cinema",
];

export const BUSES = [
  { id: "blr-cok-1", from: "Bengaluru", to: "Kochi", operator: "Malabar Night Coach", dep: "21:10", arr: "07:40", duration: "10h 30m", price: 1450, type: "Sleeper", board: "Majestic" },
  { id: "blr-cok-2", from: "Bengaluru", to: "Kochi", operator: "Western Ghats Express", dep: "22:30", arr: "09:05", duration: "10h 35m", price: 1280, type: "Semi-sleeper", board: "Silk Board" },
  { id: "cok-blr-1", from: "Kochi", to: "Bengaluru", operator: "Malabar Night Coach", dep: "20:15", arr: "06:50", duration: "10h 35m", price: 1390, type: "Sleeper", board: "Vyttila" },
  { id: "blr-maa-1", from: "Bengaluru", to: "Chennai", operator: "Coromandel Rider", dep: "23:00", arr: "05:10", duration: "6h 10m", price: 890, type: "Sleeper", board: "Shantinagar" },
  { id: "blr-maa-2", from: "Bengaluru", to: "Chennai", operator: "Deccan Dayline", dep: "06:40", arr: "13:05", duration: "6h 25m", price: 740, type: "Seater", board: "Majestic" },
  { id: "maa-blr-1", from: "Chennai", to: "Bengaluru", operator: "Coromandel Rider", dep: "22:45", arr: "05:00", duration: "6h 15m", price: 910, type: "Sleeper", board: "Koyambedu" },
  { id: "hyd-blr-1", from: "Hyderabad", to: "Bengaluru", operator: "Deccan Sleeper", dep: "21:40", arr: "07:20", duration: "9h 40m", price: 1520, type: "Sleeper", board: "MGBS" },
  { id: "blr-hyd-1", from: "Bengaluru", to: "Hyderabad", operator: "Deccan Sleeper", dep: "20:50", arr: "06:30", duration: "9h 40m", price: 1490, type: "Sleeper", board: "Majestic" },
  { id: "blr-mys-1", from: "Bengaluru", to: "Mysuru", operator: "Chamundi Shuttle", dep: "07:15", arr: "10:20", duration: "3h 05m", price: 420, type: "Seater", board: "Satellite" },
  { id: "blr-mys-2", from: "Bengaluru", to: "Mysuru", operator: "Chamundi Shuttle", dep: "16:00", arr: "19:10", duration: "3h 10m", price: 460, type: "Seater", board: "Majestic" },
  { id: "mys-blr-1", from: "Mysuru", to: "Bengaluru", operator: "Chamundi Shuttle", dep: "17:30", arr: "20:40", duration: "3h 10m", price: 430, type: "Seater", board: "Suburban stand" },
  { id: "maa-hyd-1", from: "Chennai", to: "Hyderabad", operator: "Deccan Sleeper", dep: "21:00", arr: "08:15", duration: "11h 15m", price: 1680, type: "Sleeper", board: "Koyambedu" },
  { id: "ixx-goi-1", from: "Mangaluru", to: "Goa", operator: "Coastline Roadways", dep: "22:10", arr: "06:40", duration: "8h 30m", price: 1180, type: "Sleeper", board: "State Bank" },
  { id: "goi-ixx-1", from: "Goa", to: "Mangaluru", operator: "Coastline Roadways", dep: "21:20", arr: "05:55", duration: "8h 35m", price: 1210, type: "Sleeper", board: "Panaji" },
  { id: "cok-cbe-1", from: "Kochi", to: "Coimbatore", operator: "Palakkad Pass", dep: "06:00", arr: "10:30", duration: "4h 30m", price: 560, type: "Seater", board: "Vyttila" },
  { id: "cbe-cok-1", from: "Coimbatore", to: "Kochi", operator: "Palakkad Pass", dep: "14:15", arr: "18:50", duration: "4h 35m", price: 540, type: "Seater", board: "Gandhipuram" },
];

export function busesBetween(from, to) {
  return BUSES.filter((bus) => bus.from === from && bus.to === to).sort((a, b) =>
    a.dep.localeCompare(b.dep)
  );
}

export function busById(id) {
  return BUSES.find((bus) => bus.id === id) || null;
}

export const PEOPLE = [
  {
    id: "p-aisha",
    name: "Aisha Rahman",
    place: "Kozhikode",
    age: 29,
    interests: ["History", "Food", "Books"],
    profession: "Archivist",
    starter: "The smallest museum you still remember",
    gender: "Woman",
    reply:
      "I keep a list of one-room museums. If you have one from your city, I want the name before we hit the first halt.",
  },
  {
    id: "p-dev",
    name: "Dev Menon",
    place: "Kochi",
    age: 34,
    interests: ["Startups", "Coffee", "Tech"],
    profession: "Product manager",
    starter: "A side project that refused to stay small",
    gender: "Man",
    reply:
      "Mine started as a timetable for my uncle's boats. It is now a mess I love. What are you building when nobody is paying you?",
  },
  {
    id: "p-meera",
    name: "Meera Iyer",
    place: "Chennai",
    age: 26,
    interests: ["Regional cinema", "Music", "Art"],
    profession: "Film editor",
    starter: "A song that only works at night",
    gender: "Woman",
    reply:
      "Night buses have a soundtrack whether we admit it or not. Send me one track and I'll tell you where it belongs in a cut.",
  },
  {
    id: "p-farhan",
    name: "Farhan Qureshi",
    place: "Hyderabad",
    age: 31,
    interests: ["Cricket", "Food", "Philosophy"],
    profession: "School coach",
    starter: "A match you watched for the crowd, not the score",
    gender: "Man",
    reply:
      "I want the ground, the snack, and the stranger you argued with. The score can wait until morning.",
  },
  {
    id: "p-nithya",
    name: "Nithya Rao",
    place: "Mysuru",
    age: 38,
    interests: ["Trekking", "Photography", "Coffee"],
    profession: "Landscape photographer",
    starter: "A walk you would repeat in the rain",
    gender: "Woman",
    reply:
      "Rain changes a path more than a map does. If your walk has a gate or a tea stall, start there.",
  },
  {
    id: "p-arjun",
    name: "Arjun D'Souza",
    place: "Goa",
    age: 27,
    interests: ["Music", "Art", "Films"],
    profession: "Sound recordist",
    starter: "The loudest quiet place you know",
    gender: "Man",
    reply:
      "I collect rooms that hum. Libraries, ferries, old post offices. Give me a room and I'll guess the noise.",
  },
  {
    id: "p-latha",
    name: "Latha Krishnan",
    place: "Coimbatore",
    age: 44,
    interests: ["Books", "History", "Coffee"],
    profession: "Publisher",
    starter: "A book you lent and never wanted back",
    gender: "Woman",
    reply:
      "The ones I let go are usually the ones that found a better reader. Who has yours now?",
  },
  {
    id: "p-omar",
    name: "Omar Sheikh",
    place: "Mangaluru",
    age: 23,
    interests: ["Tech", "Startups", "Cricket"],
    profession: "Student",
    starter: "The first tool you built for a friend",
    gender: "Man",
    reply:
      "Mine was a shared grocery list that crashed every Sunday. I still trust it more than the apps that replaced it.",
  },
  {
    id: "p-sara",
    name: "Sara D'Cunha",
    place: "Panaji",
    age: 33,
    interests: ["Food", "Photography", "Art"],
    profession: "Chef",
    starter: "A breakfast that tells you where you are",
    gender: "Woman",
    reply:
      "If the plate has a pickle, a bread, and a view, I can usually name the coast. What did you eat the morning you left?",
  },
  {
    id: "p-vikram",
    name: "Vikram Bedi",
    place: "Bengaluru",
    age: 41,
    interests: ["Philosophy", "Books", "Trekking"],
    profession: "Civil engineer",
    starter: "A road you trust in the dark",
    gender: "Man",
    reply:
      "I spend my weeks on alignments and my nights on buses that ignore them. Which road do you stop questioning?",
  },
  {
    id: "p-pooja",
    name: "Pooja Nair",
    place: "Thiruvananthapuram",
    age: 28,
    interests: ["Art", "Regional cinema", "History"],
    profession: "Set designer",
    starter: "A colour you associate with home",
    gender: "Woman",
    reply:
      "Mine is the green of a wet compound wall. If you give me yours, I'll tell you what I'd paint it on.",
  },
  {
    id: "p-harsh",
    name: "Harsh Patel",
    place: "Ahmedabad",
    age: 36,
    interests: ["Startups", "Coffee", "Films"],
    profession: "Founder",
    starter: "Advice you stopped taking",
    gender: "Man",
    reply:
      "I retired 'move fast' after it cost me a good cook. What line have you politely dropped?",
  },
];

export function peopleForBus(busId) {
  const index = Math.max(0, BUSES.findIndex((bus) => bus.id === busId));
  const start = (index * 3) % PEOPLE.length;
  return [0, 1, 2, 3].map((offset) => {
    const person = PEOPLE[(start + offset) % PEOPLE.length];
    return { ...person, askedYou: offset === 1 };
  });
}

export function personById(busId, personId) {
  return peopleForBus(busId).find((person) => person.id === personId) || null;
}

const SIGHTS = {
  Kochi: [
    { id: "nets", name: "Chinese Fishing Nets", area: "Fort Kochi", hours: 1, text: "Cantilevered nets along the water, best when the light is low and the catch is being hauled. You can walk the promenade, watch one lift, and be done inside an hour." },
    { id: "church", name: "St. Francis Church", area: "Fort Kochi", hours: 1, text: "The oldest European church in India, plain and cool inside. Vasco da Gama was buried here before his remains moved. An hour covers the church and the lane around it." },
    { id: "jew", name: "Jew Town and the synagogue lane", area: "Fort Kochi", hours: 2, text: "Spice shops, antique godowns, and the Pardesi Synagogue at the end of the street. Give it two hours if you want to walk slowly and stop for a drink." },
    { id: "marine", name: "Marine Drive", area: "Ernakulam", hours: 1.5, text: "A long paved walk facing the backwaters, busy at dusk. An hour and a half is enough for the stretch and a stop at a juice stall." },
    { id: "museum", name: "Hill Palace Museum", area: "Ernakulam", hours: 2.5, text: "A royal museum of painting, crowns, and oddities in a park at Tripunithura. The galleries need two and a half hours if you read the labels." },
  ],
  Bengaluru: [
    { id: "cubbon", name: "Cubbon Park", area: "MG Road", hours: 1.5, text: "A shaded grid of lawns between the library and the museum. An hour and a half covers a loop and a bench, more if you linger at the flower clock." },
    { id: "churchst", name: "Church Street", area: "MG Road", hours: 2, text: "Bookshops, small galleries, and a dinner crowd after six. Two hours lets you browse one shop and eat without rushing." },
    { id: "lalbagh", name: "Lalbagh", area: "MG Road", hours: 2, text: "The glasshouse and the lake path. Two hours if you walk to the rock and back. Morning light is kinder than noon." },
    { id: "hundred", name: "100 Feet Road", area: "Indiranagar", hours: 2, text: "Cafes, record shops, and a long pavement for people-watching. Two hours is a wander with one proper stop." },
    { id: "brew", name: "Indiranagar beer and book loop", area: "Indiranagar", hours: 3, text: "A slower circuit of lanes off 12th Main. Three hours if a bookshop turns into a table." },
    { id: "phoenix", name: "Whitefield lakeside walk", area: "Whitefield", hours: 1.5, text: "A neighbourhood loop around the lake, quiet on weekday mornings. Ninety minutes is the full circuit at an easy pace." },
  ],
  Chennai: [
    { id: "marina", name: "Marina Beach", area: "Mylapore", hours: 1.5, text: "A wide sandy walk with the traffic behind you. Ninety minutes covers a stretch of the promenade and a snack, before the sun gets hard." },
    { id: "kapaleeshwarar", name: "Kapaleeshwarar Temple tankside", area: "Mylapore", hours: 1.5, text: "The temple gopuram, the tank, and the flower market beside it. An hour and a half if you stay with the streets rather than rushing the sanctum." },
    { id: "sundar", name: "Kalakshetra grounds", area: "Thiruvanmiyur", hours: 2, text: "Banyan shade and craft studios by the beach road. Two hours lets you walk the campus slowly. Check that the grounds are open to visitors that day." },
    { id: "fort", name: "Fort St. George", area: "Parrys", hours: 2, text: "The museum inside the fort holds flags, portraits, and the city's colonial paperwork. Two hours for the museum and one wall walk." },
  ],
  Hyderabad: [
    { id: "charminar", name: "Charminar and the Laad Bazaar", area: "Old City", hours: 2.5, text: "The arch, then the bangle lanes that radiate from it. Two and a half hours if you climb, walk one market street, and drink tea." },
    { id: "chowmahalla", name: "Chowmahalla Palace", area: "Old City", hours: 1.5, text: "Courtyards and chandeliers in a compact palace. Ninety minutes is enough for the rooms without a guide rushing you." },
    { id: "golconda", name: "Golconda Fort", area: "Banjara Hills", hours: 3, text: "A climb through gates and acoustics that still carry a clap. Plan three hours, water included, and come down before the heat peaks." },
    { id: "tankbund", name: "Tank Bund", area: "Banjara Hills", hours: 1, text: "The lake edge between the city and the rocks. An hour on foot is a clean loop if you only want air and a view of the Buddha statue." },
  ],
  Mysuru: [
    { id: "palace", name: "Mysuru Palace", area: "Centre", hours: 2, text: "The main halls and the grounds outside. Two hours for a daytime visit. Sundays and the Dasara season run longer queues." },
    { id: "devaraja", name: "Devaraja Market", area: "Centre", hours: 1.5, text: "Flowers, banana leaves, and spice heaps under a long roof. Ninety minutes if you walk the centre aisle and one side lane." },
    { id: "chamundi", name: "Chamundi Hill", area: "Centre", hours: 3, text: "The temple at the top and the view back over the city. Three hours if you ride up and walk part of the way down. The steps alone are a longer outing." },
    { id: "krs", name: "Kukkarahalli Lake", area: "University", hours: 1.5, text: "A shaded walking path used by the campus. An hour and a half is one full loop with a stop for birds." },
  ],
  Goa: [
    { id: "fontainhas", name: "Fontainhas", area: "Panaji", hours: 1.5, text: "Painted houses and a small chapel in the old Latin quarter. Ninety minutes covers the lanes if you stop once for coffee." },
    { id: "reis", name: "Reis Magos Fort", area: "Panaji", hours: 2, text: "A river fort with a view back toward the capital. Two hours including the short ride out and the ramparts." },
    { id: "calangute", name: "Calangute beach walk", area: "Calangute", hours: 2, text: "A long sandy stretch. Two hours is a walk and a swim, more if you settle into a shack." },
    { id: "baga", name: "Baga creek at dusk", area: "Calangute", hours: 1.5, text: "The creek mouth when the day boats come in. Ninety minutes is enough to walk the bend and sit." },
  ],
  Mangaluru: [
    { id: "light", name: "Lighthouse Hill", area: "City", hours: 1.5, text: "A short climb for the harbour view. An hour and a half includes the hill and the stalls at the base." },
    { id: "kadri", name: "Kadri Manjunath Temple", area: "City", hours: 1.5, text: "A temple tank and bronze history above the city. Ninety minutes for the complex and the lookout." },
    { id: "panambur", name: "Panambur Beach", area: "Panambur", hours: 2, text: "A city beach north of the port. Two hours for the sand and the sunset if your bus timing allows it." },
  ],
  Coimbatore: [
    { id: "kovai", name: "Perur Pateeswarar Temple", area: "City", hours: 1.5, text: "A large Shiva temple west of the city with a quiet tank. Ninety minutes for the halls and the street outside." },
    { id: "voc", name: "VOC Park", area: "City", hours: 1, text: "A central park and zoo edge used for an evening walk. An hour is plenty if you stay with the outer paths." },
    { id: "marudhamalai", name: "Marudhamalai", area: "Foothills", hours: 3, text: "A hill temple on the way toward the ghats. Three hours with the drive. The steps are the outing. The view is the reason." },
  ],
};

export const HOTELS = [
  { id: "h1", city: "Kochi", name: "Harbour Line House", area: "Fort Kochi", price: 6400, sightIds: ["nets", "church", "jew"] },
  { id: "h2", city: "Kochi", name: "Bungalow 18", area: "Fort Kochi", price: 9100, sightIds: ["church", "jew", "nets"] },
  { id: "h3", city: "Kochi", name: "Ernakulam Station Hotel", area: "Ernakulam", price: 2800, sightIds: ["marine", "museum"] },
  { id: "h4", city: "Bengaluru", name: "Cubbon Steps", area: "MG Road", price: 5400, sightIds: ["cubbon", "churchst", "lalbagh"] },
  { id: "h5", city: "Bengaluru", name: "Indira Lane Rooms", area: "Indiranagar", price: 4700, sightIds: ["hundred", "brew", "cubbon"] },
  { id: "h6", city: "Bengaluru", name: "Whitefield Halt", area: "Whitefield", price: 3900, sightIds: ["phoenix"] },
  { id: "h7", city: "Chennai", name: "Tank Street Inn", area: "Mylapore", price: 4200, sightIds: ["kapaleeshwarar", "marina"] },
  { id: "h8", city: "Chennai", name: "Shore Verandah", area: "Thiruvanmiyur", price: 6100, sightIds: ["sundar", "marina"] },
  { id: "h9", city: "Chennai", name: "Parrys Rest", area: "Parrys", price: 3100, sightIds: ["fort"] },
  { id: "h10", city: "Hyderabad", name: "Laad Bazaar House", area: "Old City", price: 3800, sightIds: ["charminar", "chowmahalla"] },
  { id: "h11", city: "Hyderabad", name: "Charminar Courtyard", area: "Old City", price: 5600, sightIds: ["chowmahalla", "charminar"] },
  { id: "h12", city: "Hyderabad", name: "Banjara Lookout", area: "Banjara Hills", price: 7200, sightIds: ["tankbund", "golconda"] },
  { id: "h13", city: "Mysuru", name: "Palace Road Rooms", area: "Centre", price: 4500, sightIds: ["palace", "devaraja", "chamundi"] },
  { id: "h14", city: "Mysuru", name: "Market Gate Lodge", area: "Centre", price: 2900, sightIds: ["devaraja", "palace"] },
  { id: "h15", city: "Mysuru", name: "Kukkarahalli Stay", area: "University", price: 3400, sightIds: ["krs", "palace"] },
  { id: "h16", city: "Goa", name: "Fontainhas Room", area: "Panaji", price: 5200, sightIds: ["fontainhas", "reis"] },
  { id: "h17", city: "Goa", name: "Mandovi Steps", area: "Panaji", price: 6800, sightIds: ["reis", "fontainhas"] },
  { id: "h18", city: "Goa", name: "Calangute Quarter", area: "Calangute", price: 5900, sightIds: ["calangute", "baga"] },
  { id: "h19", city: "Mangaluru", name: "Light House Lodge", area: "City", price: 2600, sightIds: ["light", "kadri"] },
  { id: "h20", city: "Mangaluru", name: "Hampankatta Rooms", area: "City", price: 2200, sightIds: ["kadri", "light"] },
  { id: "h21", city: "Mangaluru", name: "Panambur Bay Stay", area: "Panambur", price: 3400, sightIds: ["panambur", "light"] },
  { id: "h22", city: "Coimbatore", name: "Town Hall Residency", area: "City", price: 3000, sightIds: ["voc", "kovai"] },
  { id: "h23", city: "Coimbatore", name: "Perur Road Inn", area: "City", price: 2400, sightIds: ["kovai", "voc"] },
  { id: "h24", city: "Coimbatore", name: "Ghat Foothill House", area: "Foothills", price: 4100, sightIds: ["marudhamalai"] },
];

function sightsFor(ids, city) {
  const list = SIGHTS[city] || [];
  return ids.map((id) => list.find((sight) => sight.id === id)).filter(Boolean);
}

export function hotelsInCity(city) {
  return HOTELS.filter((hotel) => hotel.city === city).map((hotel) => ({
    ...hotel,
    places: sightsFor(hotel.sightIds, city),
  }));
}

export function packPlaces(places, hours) {
  const fit = [];
  let left = hours;
  for (const place of places) {
    if (place.hours <= left + 1e-6) {
      fit.push(place);
      left -= place.hours;
    }
  }
  const chosen = new Set(fit);
  return {
    fit,
    later: places.filter((place) => !chosen.has(place) && place.hours > hours),
    remaining: left,
  };
}

function uniquePlaces(hotels) {
  const seen = new Set();
  const places = [];
  hotels.forEach((hotel) => {
    hotel.places.forEach((place) => {
      if (!seen.has(place.id)) {
        seen.add(place.id);
        places.push(place);
      }
    });
  });
  return places;
}

export function matchStay(query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const namedHotel = HOTELS.find((hotel) => hotel.name.toLowerCase() === q);
  if (namedHotel) {
    const withPlaces = { ...namedHotel, places: sightsFor(namedHotel.sightIds, namedHotel.city) };
    return {
      label: `${namedHotel.name}, ${namedHotel.area}`,
      places: withPlaces.places,
    };
  }

  const areaHotels = HOTELS.filter(
    (hotel) => hotel.area.toLowerCase() === q || q.includes(hotel.area.toLowerCase())
  );
  if (areaHotels.length) {
    const hydrated = areaHotels.map((hotel) => ({
      ...hotel,
      places: sightsFor(hotel.sightIds, hotel.city),
    }));
    return {
      label: `${hydrated[0].area}, ${hydrated[0].city}`,
      places: uniquePlaces(hydrated),
    };
  }

  const city = CITIES.find((name) => name.toLowerCase() === q || q.includes(name.toLowerCase()));
  if (!city) return null;
  const hydrated = hotelsInCity(city);
  return { label: city, places: uniquePlaces(hydrated) };
}

export function knownPlacesHint() {
  const areas = [...new Set(HOTELS.map((hotel) => `${hotel.area}, ${hotel.city}`))];
  return areas.slice(0, 8).join(" · ");
}
