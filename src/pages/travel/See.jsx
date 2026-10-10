import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PreferenceField } from "../../components/TravelBuddy";
import { TravelShell } from "../../components/Shells";
import { CITIES, knownPlacesHint, matchStay, packPlaces } from "../../data/content";
import { formatHours } from "../../lib/format";
import { filterByPreference, formatClock } from "../../lib/itinerary";
import { useOwnedBooking, useStore } from "../../state/store";

export default function See() {
  const { bookingId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const { saveTravel } = useStore();
  const existing = owned.booking?.travel;
  const [stayWhere, setStayWhere] = useState(existing?.mode === "see" ? existing.stayWhere || "" : "");
  const [hours, setHours] = useState(existing?.mode === "see" && existing.hours ? String(existing.hours) : "");
  const [preference, setPreference] = useState(existing?.preference || "everything");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (owned.status === "auth") return <Navigate to="/account" replace state={{ from: `/travel/${bookingId}/see` }} />;
  if (owned.status === "missing") return <Navigate to="/" replace />;

  function submit(event) {
    event.preventDefault();
    const budget = Number(hours);
    if (!stayWhere.trim()) {
      setError("Tell us where you are staying.");
      setResult(null);
      return;
    }
    if (!budget || budget <= 0) {
      setError("Add how much time you can spend.");
      setResult(null);
      return;
    }
    const matched = matchStay(stayWhere);
    if (!matched) {
      setError(`We don't have a walking list for that stay yet. Try ${knownPlacesHint()}.`);
      setResult(null);
      return;
    }
    const city = CITIES.find(
      (name) =>
        stayWhere.toLowerCase().includes(name.toLowerCase()) || matched.label.toLowerCase().includes(name.toLowerCase())
    );
    const start = 9 * 60;
    saveTravel(owned.booking.id, {
      mode: "see",
      stayWhere: stayWhere.trim(),
      hours: budget,
      ...(city ? { city } : {}),
      exploreFrom: formatClock(start),
      exploreTo: formatClock(start + budget * 60),
      preference,
    });
    setError("");
    setResult({
      ...matched,
      budget,
      packed: packPlaces(filterByPreference(matched.places, preference), budget),
    });
  }

  return (
    <TravelShell>
      <div className="tb-wrap tb-page">
        <p className="hours-label">See</p>
        <h1 className="quiet">Where are you staying?</h1>
        <p className="tb-lede">
          Name the city, the neighbourhood, or one of the hotels. Then say how much time you can give it. The places
          come back with the time each one takes.
        </p>
        <form className="tb-form" onSubmit={submit}>
          <label className="field">
            Where you are staying
            <input
              value={stayWhere}
              placeholder="Fort Kochi, Indiranagar, Goa..."
              onChange={(event) => setStayWhere(event.target.value)}
            />
          </label>
          <label className="field">
            Time you can spend
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={hours}
              placeholder="Hours"
              onChange={(event) => setHours(event.target.value)}
            />
          </label>
          <PreferenceField value={preference} onChange={setPreference} />
          {error ? <p className="tb-error">{error}</p> : null}
          <button className="tb-btn olive" type="submit">
            Show places
          </button>
        </form>
        {result ? (
          <div className="place-list">
            <p className="tb-lede">
              From {result.label}, with {formatHours(result.budget)}, these stops fit.
            </p>
            {result.packed.fit.length === 0 ? (
              <p>None of the walks fit inside {formatHours(result.budget)}.</p>
            ) : (
              result.packed.fit.map((place) => (
                <article key={place.id} className="place">
                  <p className="hours-label">If you spend {formatHours(place.hours)} in this place</p>
                  <h2>{place.name}</h2>
                  <p>{place.text}</p>
                </article>
              ))
            )}
            {result.packed.later.length ? (
              <p className="later">
                If you had longer: {result.packed.later.map((place) => `${place.name} (${formatHours(place.hours)})`).join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="tb-actions">
          <Link className="tb-btn-ghost" to={`/travel/${bookingId}`}>
            Change Stay / See
          </Link>
          <Link className="tb-btn" to={`/travel/${bookingId}/itinerary`}>
            Build the itinerary
          </Link>
          <Link className="tb-btn-ghost" to={`/ticket/${bookingId}`}>
            Back to ticket
          </Link>
        </div>
      </div>
    </TravelShell>
  );
}
