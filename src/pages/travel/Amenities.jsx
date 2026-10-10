import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { TravelBuddyChat } from "../../components/TravelBuddy";
import { TravelShell } from "../../components/Shells";
import { CITIES } from "../../data/content";
import { buildAmenityItinerary, buildItinerary } from "../../lib/itinerary";
import { getCatalog } from "../../lib/okf";
import { resolvePlace } from "../../lib/place";
import { applyGuideActions, consultGuide, replyFromGuide } from "../../lib/rag";
import { useOwnedBooking, useStore } from "../../state/store";

const KINDS = [
  ["currency", "Currency exchange"],
  ["restaurant", "Local restaurants"],
];

const PROMPTS = [
  "Where is a currency exchange near me?",
  "Which local restaurants can I fit in?",
  "Add the currency exchange to the TravelBuddy itinerary",
];

export default function Amenities() {
  const { bookingId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const { saveTravel, saveItineraryEdits, saveAmenityPlan, pushGuideTurn, clearGuideLog } = useStore();
  const navigate = useNavigate();
  const booking = owned.booking;
  const existing = booking?.travel;
  const [location, setLocation] = useState(existing?.amenityWhere || existing?.stayWhere || existing?.city || "");
  const [kinds, setKinds] = useState(existing?.amenityKinds || ["currency", "restaurant"]);
  const [merge, setMerge] = useState(existing?.amenityMode !== "separate");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  if (owned.status === "auth") {
    return <Navigate to="/account" replace state={{ from: `/travel/${bookingId}/amenities` }} />;
  }
  if (owned.status === "missing") return <Navigate to="/travel" replace />;

  const plan =
    existing?.amenityMode === "separate" ? booking.amenityPlan || buildAmenityItinerary(booking) : null;

  function toggleKind(id) {
    setKinds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function submit(event) {
    event.preventDefault();
    const place = resolvePlace(location);
    if (!place) {
      setError(`Name a city or neighbourhood we keep amenities for: ${CITIES.join(", ")}.`);
      return;
    }
    if (!kinds.length) {
      setError("Choose at least one amenity, such as a currency exchange or a local restaurant.");
      return;
    }
    const destinationCity = merge && existing?.city ? existing.city : place.city;
    if (merge && existing?.city && place.city !== existing.city) {
      setError(`This TravelBuddy itinerary is in ${existing.city}. Name a place there so the amenities sit on the same day.`);
      return;
    }
    const amenityIds = getCatalog()
      .amenities.filter((amenity) => amenity.city === destinationCity && kinds.includes(amenity.kind))
      .map((amenity) => amenity.id);
    const travel = {
      ...existing,
      city: existing?.city || place.city,
      amenityCity: destinationCity,
      amenityWhere: place.label,
      amenityKinds: kinds,
      amenityIds,
      amenityMode: merge ? "merge" : "separate",
      preference: existing?.preference || "everything",
      exploreFrom: existing?.exploreFrom || "09:00",
      exploreTo: existing?.exploreTo || "19:00",
    };
    saveTravel(booking.id, travel);
    const nextBooking = { ...booking, travel, itineraryPlan: null };
    if (merge) {
      const revised = buildItinerary(nextBooking);
      saveItineraryEdits(booking.id, booking.itineraryEdits || {}, revised);
      navigate(`/travel/${booking.id}/itinerary`);
      return;
    }
    saveAmenityPlan(booking.id, buildAmenityItinerary(nextBooking));
    setError("");
  }

  async function ask(text) {
    const question = text.trim();
    if (!question || pending) return;
    setPending(true);
    setDraft("");
    try {
      const retrieval = consultGuide(question, booking, { city: booking.travel?.amenityCity || booking.travel?.city });
      const edits = applyGuideActions(booking.itineraryEdits || {}, retrieval.actions);
      const adding = retrieval.actions.some((action) => action.type === "add_amenity");
      const separate = booking.travel?.amenityMode === "separate" && !adding;
      const revised = separate
        ? buildAmenityItinerary({ ...booking, itineraryEdits: edits })
        : buildItinerary({ ...booking, itineraryEdits: edits });
      if (separate) {
        saveItineraryEdits(booking.id, edits);
        saveAmenityPlan(booking.id, revised);
      } else {
        saveItineraryEdits(booking.id, edits, revised);
      }
      const answer = await replyFromGuide({ question, retrieval, itinerary: revised, actions: retrieval.actions });
      pushGuideTurn(booking.id, { id: `q-${Date.now()}`, role: "you", text: question });
      pushGuideTurn(booking.id, { id: `a-${Date.now()}`, role: "guide", text: answer });
    } finally {
      setPending(false);
    }
  }

  return (
    <TravelShell>
      <div className="tb-wrap tb-page">
        <p className="hours-label">TravelBuddy for amenities</p>
        <h1 className="quiet">Practical stops around you.</h1>
        <p className="tb-lede">
          Name the location and the amenities you want, such as a currency exchange near you or a local restaurant. If
          you add them to the TravelBuddy details, the day covers the destinations and these stops. If you keep them
          separate, TravelBuddy writes a new itinerary that covers the amenities.
        </p>
        <form className="tb-form" onSubmit={submit}>
          <label className="field">
            Location
            <input
              value={location}
              placeholder="Fort Kochi, MG Road, Panaji..."
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
          <fieldset className="pref-field">
            <legend>Amenities to visit</legend>
            <div className="pref-row">
              {KINDS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={kinds.includes(id) ? "tb-btn" : "tb-btn-ghost"}
                  aria-pressed={kinds.includes(id)}
                  onClick={() => toggleKind(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="pref-field">
            <legend>Update this with the TravelBuddy itinerary?</legend>
            <div className="pref-row">
              <button type="button" className={merge ? "tb-btn" : "tb-btn-ghost"} aria-pressed={merge} onClick={() => setMerge(true)}>
                Add to the TravelBuddy itinerary
              </button>
              <button
                type="button"
                className={!merge ? "tb-btn" : "tb-btn-ghost"}
                aria-pressed={!merge}
                onClick={() => setMerge(false)}
              >
                New itinerary for the amenities
              </button>
            </div>
          </fieldset>
          {error ? <p className="tb-error">{error}</p> : null}
          <button className="tb-btn" type="submit">
            {merge ? "Update the itinerary" : "Build the amenities itinerary"}
          </button>
        </form>
        {plan ? (
          <div>
            <h2>Amenities itinerary</h2>
            <p className="tb-lede">
              Leave {plan.hotel.name} at {plan.leaveHotelAt}. These stops are the amenities for {plan.city}.
            </p>
            <ol className="place-list">
              {plan.stops.map((stop) => (
                <li key={stop.id} className="place">
                  <p className="hours-label">
                    Leave {stop.fromName} at {stop.leaveAt}
                  </p>
                  <h2>{stop.name}</h2>
                  <p>
                    {stop.km} km · arrive {stop.arriveAt} · leave this stop at {stop.departAt}
                  </p>
                  {stop.blurb || stop.note ? <p>{stop.blurb || stop.note}</p> : null}
                </li>
              ))}
            </ol>
            {plan.stops.length === 0 ? <p>None of the selected amenities fit before {plan.endBy}.</p> : null}
          </div>
        ) : null}
        <TravelBuddyChat
          log={booking.guideLog}
          pending={pending}
          draft={draft}
          setDraft={setDraft}
          onAsk={ask}
          onClear={() => clearGuideLog(booking.id)}
          prompts={PROMPTS}
          placeholder="Ask TravelBuddy about a currency exchange or a local restaurant"
        />
        <div className="tb-actions">
          <Link className="tb-btn-ghost" to={`/travel/${booking.id}`}>
            Back to TravelBuddy
          </Link>
          <Link className="tb-btn olive" to={`/travel/${booking.id}/itinerary`}>
            Destination itinerary
          </Link>
        </div>
      </div>
    </TravelShell>
  );
}
