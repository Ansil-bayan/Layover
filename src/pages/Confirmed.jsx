import { Link, Navigate, useParams } from "react-router-dom";
import { BusShell } from "../components/Shells";
import { formatLong, inr } from "../lib/format";
import { useOwnedBooking } from "../state/store";

export default function Confirmed() {
  const { id } = useParams();
  const owned = useOwnedBooking(id);

  if (owned.status === "auth") {
    return <Navigate to="/account" replace state={{ from: `/booking/${id}/confirmed` }} />;
  }
  if (owned.status === "missing") {
    return (
      <BusShell>
        <div className="empty">
          <h1>That booking is not on this browser.</h1>
          <Link to="/">Search buses</Link>
        </div>
      </BusShell>
    );
  }

  const booking = owned.booking;

  return (
    <BusShell>
      <p className="kicker">Confirmed</p>
      <h1>Your ticket is confirmed.</h1>
      <p className="lede">
        {booking.passengerName} · {booking.from} to {booking.to} · {formatLong(booking.date)}. The seat number is
        still released at 6:00AM on the morning you travel.
      </p>
      <article className="ticket">
        <div className="ticket-main">
          <div className="timeline">
            <b>{booking.from}</b>
            <i />
            <b>{booking.to}</b>
          </div>
          <p>
            {formatLong(booking.date)} · {booking.dep}–{booking.arr} · {booking.operator}
          </p>
          <p>Phone {booking.phone}</p>
          <p>Fare {inr(booking.price)}. Payment Confirmed.</p>
        </div>
        <aside className="ticket-stub">
          <div>
            <div className="pnr">{booking.id}</div>
            <p>
              {booking.from.slice(0, 3).toUpperCase()} → {booking.to.slice(0, 3).toUpperCase()}
            </p>
          </div>
        </aside>
      </article>
      <div className="action-row">
        <Link className="btn" to={`/booking/${booking.id}/companions`}>
          Check Out our Buddies - MingleBuddy and TravelBuddy
        </Link>
      </div>
    </BusShell>
  );
}
