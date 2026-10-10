import { useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { RouteMap } from "../../components/RouteMap";
import { preferenceLabel, TravelBuddyChat } from "../../components/TravelBuddy";
import { TravelShell } from "../../components/Shells";
import { buildItinerary } from "../../lib/itinerary";
import { downloadItinerary } from "../../lib/pdf";
import { applyGuideActions, consultGuide, replyFromGuide } from "../../lib/rag";
import { inr } from "../../lib/format";
import { useOwnedBooking, useStore } from "../../state/store";

const PROMPTS = [
  "What time do I leave the hotel, and how far is the first stop?",
  "Which gift shops are not on the route?",
  "Add the gift shop that is not on the route",
  "What can I cover before the window ends?",
];

export default function Itinerary() {
  const { bookingId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const { saveItineraryEdits, pushGuideTurn, clearGuideLog } = useStore();
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const live = useRef(null);
  const booking = owned.booking;

  if (owned.status === "auth") {
    return <Navigate to="/account" replace state={{ from: `/travel/${bookingId}/itinerary` }} />;
  }
  if (owned.status === "missing") return <Navigate to="/travel" replace />;

  const plan = booking.itineraryPlan || buildItinerary(booking);
  live.current = { booking, plan };
  if (!plan) {
    return (
      <TravelShell>
        <div className="tb-wrap tb-page">
          <h1 className="quiet">No city guide for this ticket yet.</h1>
          <Link to={`/travel/${booking.id}`}>Choose Stay or See</Link>
        </div>
      </TravelShell>
    );
  }

  async function ask(text) {
    const question = text.trim();
    if (!question || pending) return;
    setPending(true);
    setDraft("");
    try {
      const retrieval = consultGuide(question, booking);
      const edits = applyGuideActions(booking.itineraryEdits || {}, retrieval.actions);
      const revised = buildItinerary({ ...booking, itineraryEdits: edits });
      if (retrieval.actions.length) saveItineraryEdits(booking.id, edits, revised);
      const answer = await replyFromGuide({ question, retrieval, itinerary: revised, actions: retrieval.actions });
      pushGuideTurn(booking.id, { id: `q-${Date.now()}`, role: "you", text: question });
      pushGuideTurn(booking.id, {
        id: `a-${Date.now()}`,
        role: "guide",
        text: answer,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <TravelShell>
      <div className="tb-wrap tb-page">
        <p className="hours-label">{plan.city}</p>
        <h1 className="quiet">{plan.booked ? plan.hotel.name : "Draft route"}</h1>
        <p className="tb-lede">
          {plan.booked
            ? `Room confirmed as ${booking.hotel.confirmation}. ${inr(booking.hotel.price)} a night in ${plan.hotel.area}.`
            : `This route starts at ${plan.hotel.name} so the map has a door. Book the room to hold it.`}
          {` Leave at ${plan.leaveHotelAt}. Cover what fits before ${plan.endBy}.`}
          {plan.preference && plan.preference !== "everything"
            ? ` Places are the ${preferenceLabel(plan.preference).toLowerCase()} stops.`
            : " Places include every kind of stop."}
        </p>
        <TravelBuddyChat
          log={booking.guideLog}
          pending={pending}
          draft={draft}
          setDraft={setDraft}
          onAsk={ask}
          onClear={() => clearGuideLog(booking.id)}
          prompts={PROMPTS}
          placeholder="Ask TravelBuddy when to leave, or to add a stop"
        />
        <div className="tb-actions">
          <button
            className="tb-btn"
            type="button"
            onClick={() => {
              const current = live.current;
              const latestPlan = current.plan || current.booking.itineraryPlan || buildItinerary(current.booking);
              if (latestPlan) downloadItinerary(current.booking, latestPlan);
            }}
          >
            Download PDF
          </button>
          <Link className="tb-btn-ghost" to={`/travel/${booking.id}/stay`}>
            {plan.booked ? "Change room" : "Book a room"}
          </Link>
        </div>
        <RouteMap points={plan.points} extras={plan.offRoute} />
        <div className="guide">
          <div>
            <h2>The day</h2>
            <ol className="place-list">
              {plan.stops.map((stop) => (
                <li key={stop.id} className="place">
                  <p className="hours-label">
                    Leave {stop.fromName} at {stop.leaveAt}
                  </p>
                  <h2>{stop.name}</h2>
                  <p>
                    {stop.km} km · about {stop.ride} minutes · arrive {stop.arriveAt} · stay {stop.dwell} minutes ·
                    leave this stop at {stop.departAt}
                  </p>
                  {stop.blurb || stop.note ? <p>{stop.blurb || stop.note}</p> : null}
                </li>
              ))}
            </ol>
            {plan.overflow.length ? (
              <div className="place">
                <p className="hours-label">Beyond today's window</p>
                {plan.overflow.map((stop) => (
                  <p key={stop.id}>
                    {stop.name} is {stop.km} km from {stop.fromName}. It does not fit before {plan.endBy}.
                  </p>
                ))}
              </div>
            ) : null}
            {plan.offRoute.length ? (
              <div className="place">
                <p className="hours-label">Gift shops not on this route</p>
                {plan.offRoute.map((shop) => (
                  <p key={shop.id}>
                    <strong>{shop.name}</strong> · {shop.area}. {shop.note}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </TravelShell>
  );
}
