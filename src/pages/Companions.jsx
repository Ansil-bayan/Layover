import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { BusShell } from "../components/Shells";
import { formatLong } from "../lib/format";
import { useOwnedBooking, useStore } from "../state/store";

export default function Companions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const owned = useOwnedBooking(id);
  const { user, setMingleInterest } = useStore();
  const booking = owned.booking;
  const [mingle, setMingle] = useState(booking?.mingleInterest || false);
  const [travel, setTravel] = useState(false);

  if (owned.status === "auth") {
    return <Navigate to="/account" replace state={{ from: `/booking/${id}/companions` }} />;
  }
  if (owned.status === "missing") {
    return (
      <BusShell>
        <div className="empty">
          <h1>That booking is not on this browser.</h1>
          <Link to="/trips">Your trips</Link>
        </div>
      </BusShell>
    );
  }

  function toggleMingle() {
    const next = !mingle;
    setMingle(next);
    setMingleInterest(booking.id, next);
  }

  function enterMingle() {
    setMingleInterest(booking.id, true);
    if (!user.profile) {
      navigate(`/mingle/profile?next=${encodeURIComponent(`/mingle?booking=${booking.id}`)}`);
      return;
    }
    navigate(`/mingle?booking=${booking.id}`);
  }

  return (
    <BusShell>
      <p className="kicker">Add-ons · {booking.id}</p>
      <h1>MingleBuddy and TravelBuddy</h1>
      <p className="lede">
        {booking.from} to {booking.to}, {formatLong(booking.date)}. Pick MingleBuddy, TravelBuddy, both, or neither.
        The seat stays unassigned until 6:00 on the travel morning.
      </p>
      <div className="companion-grid">
        <button type="button" className="buddy-card mingle" aria-pressed={mingle} onClick={toggleMingle}>
          <p className="pick">{mingle ? "Selected" : "Optional"}</p>
          <h2>MingleBuddy</h2>
          <p>
            Your buddy for finding someone to talk to on the journey. Say yes and you join the others on this
            departure who did the same. You message them one to one. In each chat you can send a request to sit
            together, and the morning allotment places you side by side.
          </p>
        </button>
        <button type="button" className="buddy-card travel" aria-pressed={travel} onClick={() => setTravel((value) => !value)}>
          <p className="pick">{travel ? "Selected" : "Optional"}</p>
          <h2>TravelBuddy</h2>
          <p>
            Your buddy for the city after the bus. Stay if you want a hotel. See if you want somewhere to walk.
            Choose one or both, then match hotels and sights to the hours you actually have.
          </p>
        </button>
      </div>
      <div className="action-row">
        {mingle ? (
          <button className="btn" type="button" onClick={enterMingle}>
            Enter MingleBuddy
          </button>
        ) : null}
        {travel ? (
          <Link className="btn navy" to={`/travel/${booking.id}`}>
            Enter TravelBuddy
          </Link>
        ) : null}
        <Link className="btn ghost" to={`/ticket/${booking.id}`}>
          {mingle || travel ? "Go to the ticket" : "Continue with the ticket"}
        </Link>
      </div>
    </BusShell>
  );
}
