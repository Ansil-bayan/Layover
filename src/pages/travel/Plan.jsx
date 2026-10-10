import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { PreferenceField } from "../../components/TravelBuddy";
import { TravelShell } from "../../components/Shells";
import { CITIES, hotelsInCity, packPlaces } from "../../data/content";
import { formatHours, hoursBetween, inr } from "../../lib/format";
import { filterByPreference } from "../../lib/itinerary";
import { getCatalog } from "../../lib/okf";
import { useOwnedBooking, useStore } from "../../state/store";

export default function Plan() {
  const { bookingId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const { saveTravel, bookHotel } = useStore();
  const navigate = useNavigate();
  const catalog = getCatalog();
  const existing = owned.booking?.travel;
  const [city, setCity] = useState(existing?.city || owned.booking?.to || "");
  const [stayFrom, setStayFrom] = useState(existing?.stayFrom || "14:00");
  const [stayTo, setStayTo] = useState(existing?.stayTo || "10:00");
  const [exploreFrom, setExploreFrom] = useState(existing?.exploreFrom || "16:00");
  const [exploreTo, setExploreTo] = useState(existing?.exploreTo || "19:00");
  const [preference, setPreference] = useState(existing?.preference || "everything");
  const [error, setError] = useState("");

  if (owned.status === "auth") return <Navigate to="/account" replace state={{ from: `/travel/${bookingId}/plan` }} />;
  if (owned.status === "missing") return <Navigate to="/" replace />;

  const stayHours = hoursBetween(stayFrom, stayTo, true);
  const exploreHours = hoursBetween(exploreFrom, exploreTo, false);
  const matchedCity = CITIES.find((name) => name.toLowerCase() === city.trim().toLowerCase());
  const hotels = matchedCity && stayHours > 0 && exploreHours > 0 ? hotelsInCity(matchedCity) : [];

  function submit(event) {
    event.preventDefault();
    if (!matchedCity) {
      setError(`Use a city we keep hotels for: ${CITIES.join(", ")}.`);
      return;
    }
    if (stayHours <= 0) {
      setError("Add the hours you need the room.");
      return;
    }
    if (exploreHours <= 0) {
      setError("Add a daytime window for sightseeing. If it crosses midnight, split it into the hours you will actually walk.");
      return;
    }
    saveTravel(owned.booking.id, {
      mode: "both",
      city: matchedCity,
      stayFrom,
      stayTo,
      exploreFrom,
      exploreTo,
      preference,
    });
    setError("");
  }

  function book(hotel) {
    if (!matchedCity || stayHours <= 0 || exploreHours <= 0) return;
    saveTravel(owned.booking.id, {
      mode: "both",
      city: matchedCity,
      stayFrom,
      stayTo,
      exploreFrom,
      exploreTo,
      preference,
    });
    const place = catalog.hotels.find((item) => item.id === hotel.id);
    bookHotel(owned.booking.id, {
      ...hotel,
      city: matchedCity,
      lat: place?.lat,
      lng: place?.lng,
    });
    navigate(`/travel/${owned.booking.id}/itinerary`);
  }

  return (
    <TravelShell>
      <div className="tb-wrap tb-page">
        <p className="tb-back-row">
          <Link className="tb-btn" to={`/travel/${bookingId}`}>
            Back
          </Link>
        </p>
        <p className="hours-label">Stay and see</p>
        <h1 className="quiet">Hours first. Then the hotels.</h1>
        <p className="tb-lede">
          Say when you need the room, and when you want to be out looking. Each hotel shows the places that fit that
          outing if you stay there.
        </p>
        <form className="tb-form" onSubmit={submit}>
          <label className="field">
            City you are staying in
            <input list="plan-cities" value={city} onChange={(event) => setCity(event.target.value)} />
            <datalist id="plan-cities">
              {CITIES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <div className="time-grid">
            <label className="field">
              Accommodation from
              <input type="time" value={stayFrom} onChange={(event) => setStayFrom(event.target.value)} />
            </label>
            <label className="field">
              Accommodation until
              <input type="time" value={stayTo} onChange={(event) => setStayTo(event.target.value)} />
            </label>
            <label className="field">
              Explore from
              <input type="time" value={exploreFrom} onChange={(event) => setExploreFrom(event.target.value)} />
            </label>
            <label className="field">
              Explore until
              <input type="time" value={exploreTo} onChange={(event) => setExploreTo(event.target.value)} />
            </label>
          </div>
          <PreferenceField value={preference} onChange={setPreference} />
          {error ? <p className="tb-error">{error}</p> : null}
          <button className="tb-btn" type="submit">
            Show hotels and places
          </button>
        </form>
        {matchedCity && stayHours > 0 && exploreHours > 0 ? (
          <div className="hotel-list">
            {hotels.map((hotel) => {
              const packed = packPlaces(filterByPreference(hotel.places, preference), exploreHours);
              return (
                <article key={hotel.id} className="hotel">
                  <div className="hotel-top">
                    <div>
                      <h2>{hotel.name}</h2>
                      <p className="area">{hotel.area}</p>
                    </div>
                    <div className="hotel-book">
                      <div className="price">{inr(hotel.price)} / night</div>
                      <button className="tb-btn" type="button" onClick={() => book(hotel)}>
                        Book this room
                      </button>
                    </div>
                  </div>
                  <p>
                    Room held for {stayFrom}–{stayTo} ({formatHours(stayHours)}). Your explore window is {exploreFrom}–
                    {exploreTo} ({formatHours(exploreHours)}).
                  </p>
                  <div className="outing">
                    <h3>If you stay here</h3>
                    {packed.fit.length === 0 ? (
                      <p>Nothing on this hotel’s walk fits inside {formatHours(exploreHours)}.</p>
                    ) : (
                      packed.fit.map((place) => (
                        <article key={place.id}>
                          <p className="hours-label">If you spend {formatHours(place.hours)} here</p>
                          <h3>{place.name}</h3>
                          <p>{place.text}</p>
                        </article>
                      ))
                    )}
                    {packed.later.length ? (
                      <p className="later">
                        Needs a longer window: {packed.later.map((place) => `${place.name} (${formatHours(place.hours)})`).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
        <div className="tb-actions">
          <Link className="tb-btn-ghost" to={`/travel/${bookingId}`}>
            Change Stay / See
          </Link>
          <Link className="tb-btn olive" to={`/ticket/${bookingId}`}>
            Back to ticket
          </Link>
        </div>
      </div>
    </TravelShell>
  );
}
