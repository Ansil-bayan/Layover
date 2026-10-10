import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MingleShell } from "../../components/Shells";
import { personById } from "../../data/content";
import { sitStatus, useOwnedBooking, useStore } from "../../state/store";

export default function Chat() {
  const { bookingId, personId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const { user, messages, sitRequests, sendMessage, sendSitRequest, respondSitRequest, undoNeighbor } = useStore();
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const booking = owned.booking;

  if (owned.status === "auth") {
    return <Navigate to="/account" replace state={{ from: `/mingle/journey/${bookingId}/chat/${personId}` }} />;
  }
  if (owned.status === "missing" || !booking?.mingleInterest || !user?.profile) {
    return <Navigate to={booking ? `/mingle/journey/${bookingId}` : "/mingle"} replace />;
  }

  const person = personById(booking.busId, personId);
  if (!person) {
    return <Navigate to={`/mingle/journey/${booking.id}`} replace />;
  }

  const status = sitStatus({ booking, userId: user.id, person, requests: sitRequests });
  const thread = messages.filter(
    (message) =>
      message.bookingId === booking.id &&
      ((message.fromId === user.id && message.toId === person.id) ||
        (message.fromId === person.id && message.toId === user.id))
  );

  function submit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    sendMessage(booking.id, person.id, draft);
    setDraft("");
  }

  function requestSeat() {
    const result = sendSitRequest(booking.id, person.id);
    if (!result.ok) {
      setNote(result.error);
      return;
    }
    setNote(
      result.seat
        ? `Neighbor seat updated. You are in ${result.seat.seat}, beside ${person.name} in ${result.seat.neighborSeat}.`
        : `${person.name} agreed. You will sit next to each other when seats are allotted. You can change or undo this.`
    );
  }

  function undoSeat() {
    const result = undoNeighbor(booking.id);
    if (!result.ok) {
      setNote(result.error);
      return;
    }
    setNote(
      result.seat
        ? `Neighbor seat undone. Your seat is now ${result.seat.seat}.`
        : "Neighbor seat undone. The morning allotment will seat you on your own."
    );
  }

  function respond(accept) {
    const result = respondSitRequest(booking.id, person.id, accept);
    if (!result.ok) {
      setNote(result.error);
      return;
    }
    if (!accept) {
      setNote("You declined the seat request.");
      return;
    }
    setNote(
      result.seat
        ? `Neighbor seat updated. You are in ${result.seat.seat}, beside ${person.name} in ${result.seat.neighborSeat}.`
        : `You will sit next to ${person.name} when seats are allotted. You can change or undo this.`
    );
  }

  return (
    <MingleShell>
      <div className="mb-wrap mb-page">
        <Link to={`/mingle/journey/${booking.id}`} className="mb-kicker">
          Back to the room
        </Link>
        <div className="chat-shell" style={{ marginTop: 12 }}>
          <header className="chat-head">
            <h1>{person.name}</h1>
            <p>
              {person.place} · {person.age} · {person.gender} · {person.profession}
            </p>
            <p>{person.interests.join(" · ")}</p>
          </header>
          <div className="thread">
            {thread.length === 0 ? (
              <div className="prompt-card">
                Their starter: {person.starter}. This thread stays between you and {person.name}.
              </div>
            ) : (
              thread.map((message) => (
                <div key={message.id} className={`bubble ${message.fromId === user.id ? "mine" : "theirs"}`}>
                  {message.text}
                </div>
              ))
            )}
          </div>
          <div className="sit-bar">
            <SitCopy status={status} person={person} lockedSeat={booking.seatLocked} note={note} />
            {status.pendingInvite ? (
              <div className="mb-hero-actions">
                <button className="mb-btn" type="button" onClick={() => respond(true)}>
                  Accept and sit together
                </button>
                <button className="mb-btn-ghost" type="button" onClick={() => respond(false)}>
                  Decline
                </button>
              </div>
            ) : status.isPartner ? (
              <button className="mb-btn" type="button" onClick={undoSeat}>
                Undo neighbor seat
              </button>
            ) : (
              <button className="mb-btn" type="button" onClick={requestSeat}>
                {status.partnerId ? `Change neighbor seat to ${person.name}` : "Send req to sit next to each other"}
              </button>
            )}
          </div>
          <form className="composer" onSubmit={submit}>
            <input
              value={draft}
              placeholder={`Message ${person.name}`}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button className="mb-btn" type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
    </MingleShell>
  );
}

function SitCopy({ status, person, lockedSeat, note }) {
  if (note) return <p>{note}</p>;
  if (status.isPartner && status.locked && lockedSeat?.neighborName) {
    return (
      <p>
        Seats are out. You are in {lockedSeat.seat}, beside {lockedSeat.neighborName} in {lockedSeat.neighborSeat}.
        You can undo this or change it from another chat.
      </p>
    );
  }
  if (status.isPartner) return <p>You will sit next to {person.name}. You can undo that, or change it from another chat.</p>;
  if (status.partnerId) return <p>Your neighbor is already chosen. This replaces that seat with {person.name}.</p>;
  if (status.pendingInvite) return <p>{person.name} sent a request to sit next to each other.</p>;
  return <p>Ask for the seat beside {person.name}. You can change or undo it later, including after the seat is fixed.</p>;
}
