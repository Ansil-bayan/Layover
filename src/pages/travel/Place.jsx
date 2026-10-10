import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { PreferenceField } from "../../components/TravelBuddy";
import { TravelShell } from "../../components/Shells";
import { CITIES } from "../../data/content";
import { resolvePlace } from "../../lib/place";
import { useOwnedBooking, useStore } from "../../state/store";

export default function Place() {
  const { bookingId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const { saveTravel } = useStore();
  const navigate = useNavigate();
  const existing = owned.booking?.travel;
  const [location, setLocation] = useState(existing?.mode === "told" ? existing.stayWhere || "" : "");
  const [exploreFrom, setExploreFrom] = useState(existing?.exploreFrom || "09:00");
  const [exploreTo, setExploreTo] = useState(existing?.exploreTo || "18:00");
  const [preference, setPreference] = useState(existing?.preference || "everything");
  const [error, setError] = useState("");

  if (owned.status === "auth") {
    return <Navigate to="/account" replace state={{ from: `/travel/${bookingId}/place` }} />;
  }
  if (owned.status === "missing") return <Navigate to="/travel" replace />;

  function submit(event) {
    event.preventDefault();
    const place = resolvePlace(location);
    if (!place) {
      setError(`Name a city or neighbourhood we keep a guide for: ${CITIES.join(", ")}.`);
      return;
    }
    if (!exploreFrom || !exploreTo || exploreFrom === exploreTo) {
      setError("Add a start and an end for the time you can spend.");
      return;
    }
    saveTravel(owned.booking.id, {
      mode: "told",
      city: place.city,
      stayWhere: place.label,
      exploreFrom,
      exploreTo,
      preference,
    });
    navigate(`/travel/${owned.booking.id}/itinerary`);
  }

  return (
    <TravelShell>
      <div className="tb-wrap tb-page">
        <p className="hours-label">I'll tell the place</p>
        <h1 className="quiet">Tell TravelBuddy where you are.</h1>
        <p className="tb-lede">
          Name the location, the hours you can be out, and the kind of places you want. The itinerary is built from that
          selection.
        </p>
        <form className="tb-form" onSubmit={submit}>
          <label className="field">
            Location
            <input
              value={location}
              placeholder="Fort Kochi, Indiranagar, Mysuru..."
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
          <div className="time-grid">
            <label className="field">
              Time from
              <input type="time" value={exploreFrom} onChange={(event) => setExploreFrom(event.target.value)} />
            </label>
            <label className="field">
              Time until
              <input type="time" value={exploreTo} onChange={(event) => setExploreTo(event.target.value)} />
            </label>
          </div>
          <PreferenceField value={preference} onChange={setPreference} />
          {error ? <p className="tb-error">{error}</p> : null}
          <button className="tb-btn" type="submit">
            Build the itinerary
          </button>
        </form>
        <div className="tb-actions">
          <Link className="tb-btn-ghost" to={`/travel/${bookingId}`}>
            Back to TravelBuddy
          </Link>
        </div>
      </div>
    </TravelShell>
  );
}
