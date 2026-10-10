import { Link, Navigate } from "react-router-dom";
import { BusShell } from "../components/Shells";
import { formatLong } from "../lib/format";
import { useStore } from "../state/store";

export default function Trips() {
  const { user, bookings } = useStore();
  if (!user) return <Navigate to="/account" replace state={{ from: "/trips" }} />;
  const mine = bookings.filter((booking) => booking.userId === user.id);

  return (
    <BusShell>
      <p className="kicker">Your trips</p>
      <h1>Tickets on this browser</h1>
      {mine.length === 0 ? (
        <div className="empty">
          <p>No tickets yet.</p>
          <Link to="/">Find a bus</Link>
        </div>
      ) : (
        <div className="trip-list" style={{ marginTop: 18 }}>
          {mine.map((booking) => (
            <Link key={booking.id} to={`/ticket/${booking.id}`} className="trip-card" style={{ textDecoration: "none" }}>
              <div>
                <div className="operator">
                  {booking.from} to {booking.to}
                </div>
                <div className="meta">
                  {formatLong(booking.date)} · {booking.operator}
                </div>
              </div>
              <div className="timeline">
                <b>{booking.dep}</b>
                <i />
                <b>{booking.arr}</b>
              </div>
              <div className="price">
                <strong>{booking.seatLocked ? booking.seatLocked.seat : "Seat pending"}</strong>
                <div className="meta">{booking.id}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </BusShell>
  );
}
