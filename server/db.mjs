import pg from "pg";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    place TEXT,
    age INTEGER,
    gender TEXT,
    profession TEXT,
    interests JSONB NOT NULL DEFAULT '[]',
    starter TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    travel_date TEXT NOT NULL,
    operator TEXT,
    bus_type TEXT,
    departs TEXT,
    arrives TEXT,
    price INTEGER,
    mingle_interest BOOLEAN NOT NULL DEFAULT FALSE,
    hotel JSONB,
    itinerary JSONB,
    seat JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS mingle_messages (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS guide_messages (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS amenities (
    id TEXT PRIMARY KEY,
    city TEXT NOT NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    area TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    note TEXT
  )`,
];

export function createDatabase(connectionString) {
  const pool = new pg.Pool({ connectionString });
  let ready = null;

  function ensure() {
    if (!ready) {
      ready = (async () => {
        for (const statement of SCHEMA) {
          await pool.query(statement);
        }
      })().catch((error) => {
        ready = null;
        throw error;
      });
    }
    return ready;
  }

  async function save(kind, record) {
    await ensure();
    if (kind === "profile") {
      await pool.query(
        `INSERT INTO profiles (user_id, name, email, place, age, gender, profession, interests, starter, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           place = EXCLUDED.place,
           age = EXCLUDED.age,
           gender = EXCLUDED.gender,
           profession = EXCLUDED.profession,
           interests = EXCLUDED.interests,
           starter = EXCLUDED.starter,
           updated_at = NOW()`,
        [
          record.userId,
          record.name,
          record.email,
          record.place || null,
          record.age ?? null,
          record.gender || null,
          record.profession || null,
          JSON.stringify(record.interests || []),
          record.starter || null,
        ]
      );
      return;
    }
    if (kind === "ticket") {
      await pool.query(
        `INSERT INTO tickets (
           id, user_id, passenger_name, phone, from_city, to_city, travel_date,
           operator, bus_type, departs, arrives, price, mingle_interest, hotel, itinerary, seat, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb,$16::jsonb,NOW())
         ON CONFLICT (id) DO UPDATE SET
           passenger_name = EXCLUDED.passenger_name,
           phone = EXCLUDED.phone,
           mingle_interest = EXCLUDED.mingle_interest,
           hotel = EXCLUDED.hotel,
           itinerary = EXCLUDED.itinerary,
           seat = EXCLUDED.seat,
           updated_at = NOW()`,
        [
          record.id,
          record.userId,
          record.passengerName,
          record.phone,
          record.from,
          record.to,
          record.date,
          record.operator || null,
          record.type || null,
          record.dep || null,
          record.arr || null,
          record.price ?? null,
          Boolean(record.mingleInterest),
          JSON.stringify(record.hotel || null),
          JSON.stringify(record.itinerary || null),
          JSON.stringify(record.seat || null),
        ]
      );
      return;
    }
    if (kind === "mingle") {
      await pool.query(
        `INSERT INTO mingle_messages (id, booking_id, from_id, to_id, body, sent_at)
         VALUES ($1,$2,$3,$4,$5,TO_TIMESTAMP($6 / 1000.0))
         ON CONFLICT (id) DO NOTHING`,
        [record.id, record.bookingId, record.fromId, record.toId, record.text, record.at]
      );
      return;
    }
    if (kind === "guide-clear") {
      await pool.query(`DELETE FROM guide_messages WHERE booking_id = $1`, [record.bookingId]);
      return;
    }
    if (kind === "guide") {
      await pool.query(
        `INSERT INTO guide_messages (id, booking_id, user_id, role, body, sent_at)
         VALUES ($1,$2,$3,$4,$5,TO_TIMESTAMP($6 / 1000.0))
         ON CONFLICT (id) DO NOTHING`,
        [record.id, record.bookingId, record.userId, record.role, record.text, record.at || Date.now()]
      );
      return;
    }
    if (kind === "amenity-catalog") {
      for (const item of record.items || []) {
        await pool.query(
          `INSERT INTO amenities (id, city, name, kind, area, lat, lng, note)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (id) DO UPDATE SET
             city = EXCLUDED.city,
             name = EXCLUDED.name,
             kind = EXCLUDED.kind,
             area = EXCLUDED.area,
             lat = EXCLUDED.lat,
             lng = EXCLUDED.lng,
             note = EXCLUDED.note`,
          [item.id, item.city, item.name, item.kind, item.area || null, item.lat ?? null, item.lng ?? null, item.note || null]
        );
      }
    }
  }

  return { ensure, save, pool };
}
