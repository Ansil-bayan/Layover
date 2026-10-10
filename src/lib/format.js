export function inr(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLong(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayInputValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function seatReleaseAt(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 6, 0, 0, 0);
}

export function hoursBetween(start, end, allowOvernight) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0 && allowOvernight) mins += 24 * 60;
  if (mins <= 0) return 0;
  return Math.round((mins / 60) * 10) / 10;
}

export function formatHours(hours) {
  if (hours === 1) return "1 hour";
  if (Number.isInteger(hours)) return `${hours} hours`;
  return `${hours} hours`;
}

export function uid(prefix = "") {
  const body = Math.random().toString(36).slice(2, 8).toUpperCase();
  return prefix ? `${prefix}${body}` : body;
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function assignSeats(bookingId, partner) {
  const pairIndex = hash(bookingId) % 20;
  const row = Math.floor(pairIndex / 2) + 1;
  const letters = pairIndex % 2 === 0 ? ["A", "B"] : ["C", "D"];
  if (partner) {
    return {
      seat: `${row}${letters[0]}`,
      neighborSeat: `${row}${letters[1]}`,
      neighborName: partner.name,
      neighborId: partner.id,
    };
  }
  const letter = letters[hash(`${bookingId}:solo`) % 2];
  return { seat: `${row}${letter}`, neighborSeat: null, neighborName: null, neighborId: null };
}

export function allotmentMoment(booking) {
  return Math.max(seatReleaseAt(booking.date).getTime(), booking.createdAt);
}

export function emptyProfile(name = "") {
  return {
    name,
    place: "",
    age: "",
    interests: [],
    profession: "",
    starter: "",
    gender: "",
  };
}

export function validateProfile(profile) {
  const errors = {};
  if (!profile.name.trim()) errors.name = "Add the name people on the bus should see.";
  if (!profile.place.trim()) errors.place = "Add the place you are from.";
  const age = Number(profile.age);
  if (!profile.age || Number.isNaN(age)) errors.age = "Add your age.";
  else if (age < 18 || age > 99) errors.age = "MingleBuddy is for travellers 18 and over.";
  if (!profile.interests.length) errors.interests = "Pick at least one interest.";
  if (!profile.profession.trim()) errors.profession = "Add what you do.";
  if (!profile.starter.trim()) errors.starter = "Add a topic you can start with.";
  if (!profile.gender) errors.gender = "Choose a gender, or say you prefer not to.";
  return errors;
}

export function normalizeProfile(profile) {
  return {
    name: profile.name.trim(),
    place: profile.place.trim(),
    age: Number(profile.age),
    interests: [...profile.interests],
    profession: profile.profession.trim(),
    starter: profile.starter.trim(),
    gender: profile.gender,
  };
}
