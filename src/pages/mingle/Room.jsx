import { Link, Navigate, useParams } from "react-router-dom";
import { MingleShell } from "../../components/Shells";
import { peopleForBus } from "../../data/content";
import { formatLong } from "../../lib/format";
import { sitStatus, useOwnedBooking, useStore } from "../../state/store";

export default function Room() {
  const { bookingId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const { user, sitRequests } = useStore();
  const booking = owned.booking;

  if (owned.status === "auth") {
    return <Navigate to="/account" replace state={{ from: `/mingle/journey/${bookingId}` }} />;
  }
  if (owned.status === "missing" || !booking?.mingleInterest) {
    return (
      <MingleShell>
        <div className="mb-wrap mb-page">
          <h1 className="page-title">This room is closed.</h1>
          <p>Opt in for MingleBuddy on the booking, with a profile, and the departure opens.</p>
          <Link className="mb-btn" to={booking ? `/booking/${booking.id}/companions` : "/"}>
            Back
          </Link>
        </div>
      </MingleShell>
    );
  }
  if (!user.profile) {
    return <Navigate to={`/mingle/profile?next=${encodeURIComponent(`/mingle/journey/${booking.id}`)}`} replace />;
  }

  const people = peopleForBus(booking.busId);

  return (
    <MingleShell>
      <div className="mb-wrap mb-page">
        <p className="mb-back-row">
          <Link className="mb-btn" to={`/mingle?booking=${booking.id}`}>
            Back
          </Link>
        </p>
        <p className="mb-kicker">
          {booking.from} → {booking.to} · {formatLong(booking.date)}
        </p>
        <h1 className="page-title">The departure room</h1>
        <p style={{ color: "var(--muted)", maxWidth: "40rem" }}>
          These travellers asked to find a MingleBuddy on this bus. Open one to talk privately. Nothing here is a
          group conversation.
        </p>
        <div className="room-list">
          {people.map((person, index) => {
            const status = sitStatus({ booking, userId: user.id, person, requests: sitRequests });
            return (
              <Link key={person.id} className="person-row" to={`/mingle/journey/${booking.id}/chat/${person.id}`}>
                <div className="idx">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <h2>{person.name}</h2>
                  <p>
                    {person.place} · {person.age} · {person.gender} · {person.profession}
                  </p>
                  <p>{person.interests.join(" · ")}</p>
                  <p>Start from: {person.starter}</p>
                </div>
                <div className="tag">
                  {status.isPartner ? "Sitting together" : status.pendingInvite ? "Seat request" : "Message"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </MingleShell>
  );
}
