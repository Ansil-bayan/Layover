export function persist(kind, record) {
  fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, record }),
    keepalive: true,
  }).catch(() => {});
}

export function persistProfile(user) {
  if (!user) return;
  const profile = user.profile;
  persist("profile", {
    userId: user.id,
    name: profile?.name || user.name,
    email: user.email,
    place: profile?.place || null,
    age: profile?.age ?? null,
    gender: profile?.gender || null,
    profession: profile?.profession || null,
    interests: profile?.interests || [],
    starter: profile?.starter || null,
  });
}

export function persistTicket(booking) {
  if (!booking) return;
  persist("ticket", {
    id: booking.id,
    userId: booking.userId,
    passengerName: booking.passengerName,
    phone: booking.phone,
    from: booking.from,
    to: booking.to,
    date: booking.date,
    operator: booking.operator,
    type: booking.type,
    dep: booking.dep,
    arr: booking.arr,
    price: booking.price,
    mingleInterest: booking.mingleInterest,
    hotel: booking.hotel,
    seat: booking.seatLocked,
    itinerary: {
      edits: booking.itineraryEdits || null,
      plan: booking.itineraryPlan || null,
      travel: booking.travel || null,
      amenityPlan: booking.amenityPlan || null,
    },
  });
}

export function persistAmenityCatalog(items) {
  if (!items?.length) return;
  persist("amenity-catalog", {
    items: items.map((item) => ({
      id: item.id,
      city: item.city,
      name: item.name,
      kind: item.kind,
      area: item.area,
      lat: item.lat,
      lng: item.lng,
      note: item.note,
    })),
  });
}

export function persistMingleMessage(message) {
  persist("mingle", message);
}

export function persistClearGuide(bookingId) {
  if (!bookingId) return;
  persist("guide-clear", { bookingId });
}

export function persistGuideMessage(bookingId, userId, turn) {
  persist("guide", {
    id: turn.id,
    bookingId,
    userId,
    role: turn.role,
    text: turn.text,
    at: Date.now(),
  });
}
