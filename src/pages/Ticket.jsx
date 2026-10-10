import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { BusShell } from "../components/Shells";
import { formatHours, formatLong, hoursBetween, inr } from "../lib/format";
import { plannedNeighbor, useOwnedBooking, useStore } from "../state/store";

function RowPreview({ seat, neighborSeat }) {
  const mine = seat?.slice(-1);
  const pal = neighborSeat?.slice(-1);
  return (
    <div className="row-preview" aria-hidden="true">
      {["A", "B", "C", "D"].map((letter) => (
        <span key={letter} className={letter === mine ? "me" : letter === pal ? "pal" : ""}>
          {letter}
        </span>
      ))}
    </div>
  );
}

export default function Ticket() {
  const { id } = useParams();
  const owned = useOwnedBooking(id);
  const { user, sitRequests, syncSeat, undoNeighbor } = useStore();
  const booking = owned.booking;

  useEffect(() => {
    if (booking) syncSeat(booking.id);
  }, [booking, syncSeat]);

  if (owned.status === "auth") {
    return <Navigate to="/account" replace state={{ from: `/ticket/${id}` }} />;
  }
  if (owned.status === "missing") {
    return (
      <BusShell>
        <div className="empty">
          <h1>That ticket is not on this browser.</h1>
          <Link to="/">Search buses</Link>
        </div>
      </BusShell>
    );
  }

  const locked = booking.seatLocked;
  const neighbor = locked?.neighborName
    ? { name: locked.neighborName }
    : plannedNeighbor(booking, user.id, sitRequests);

  return (
    <BusShell>
      <p className="kicker">Confirmed ticket</p>
      <h1>{booking.passengerName}</h1>
      <article className="ticket">
        <div className="ticket-main">
          <div className="timeline">
            <b>{booking.from}</b>
            <i />
            <b>{booking.to}</b>
          </div>
          <p>
            {formatLong(booking.date)} · {booking.dep}–{booking.arr} · {booking.duration}
          </p>
          <p>
            {booking.operator} · {booking.type} · Board at {booking.board}
          </p>
          <p>Phone {booking.phone}</p>
          <p>
            <span className={locked ? "stamp go" : "stamp wait"}>{locked ? "Seat confirmed" : "Seat pending"}</span>
          </p>
          {locked ? (
            <>
              <div className="seat-big">{locked.seat}</div>
              <RowPreview seat={locked.seat} neighborSeat={locked.neighborSeat} />
              <p>
                {locked.neighborName
                  ? `Beside ${locked.neighborName} in ${locked.neighborSeat}.`
                  : "The seat beside you is another passenger."}
              </p>
            </>
          ) : (
            <>
              <div className="seat-big">6:00</div>
              <p>Your seat number is released at 6:00 on {formatLong(booking.date)}.</p>
              {neighbor ? <p>You and {neighbor.name} will sit next to each other when that allotment runs.</p> : null}
            </>
          )}
          <p className="fine">Fare {inr(booking.price)} · collected as a confirmed ticket in this demo.</p>
        </div>
        <aside className="ticket-stub">
          <div>
            <div className="pnr">{booking.id}</div>
            <p>
              {booking.from.slice(0, 3).toUpperCase()} → {booking.to.slice(0, 3).toUpperCase()}
            </p>
          </div>
          <div>
            <div>{booking.dep}</div>
            <div>{locked ? locked.seat : "Seat 6:00"}</div>
          </div>
        </aside>
      </article>

      <div className="action-row">
        {booking.mingleInterest ? (
          <Link className="btn" to={user.profile ? "/mingle" : "/mingle/profile?next=/mingle"}>
            Open MingleBuddy
          </Link>
        ) : null}
        {neighbor ? (
          <button className="btn ghost" type="button" onClick={() => undoNeighbor(booking.id)}>
            Undo neighbor seat
          </button>
        ) : null}
        <Link className="btn navy" to={`/travel/${booking.id}`}>
          Open TravelBuddy
        </Link>
        <Link className="btn ghost" to={`/travel/${booking.id}/itinerary`}>
          Itinerary
        </Link>
        <Link className="btn ghost" to={`/booking/${booking.id}/companions`}>
          Buddy choices
        </Link>
      </div>
      {booking.travel ? <TravelNote travel={booking.travel} /> : null}
    </BusShell>
  );
}

function TravelNote({ travel }) {
  if (travel.mode === "stay" && travel.city) {
    return <p className="fine">TravelBuddy stay search: hotels in {travel.city}.</p>;
  }
  if (travel.mode === "both" && travel.city) {
    const stay = hoursBetween(travel.stayFrom, travel.stayTo, true);
    const explore = hoursBetween(travel.exploreFrom, travel.exploreTo, false);
    return (
      <p className="fine">
        TravelBuddy: room in {travel.city} for {formatHours(stay)}, out for {formatHours(explore)}.
      </p>
    );
  }
  if (travel.mode === "see" && travel.stayWhere) {
    return (
      <p className="fine">
        TravelBuddy sights from {travel.stayWhere}, with {formatHours(Number(travel.hours) || 0)}.
      </p>
    );
  }
  return null;
}
