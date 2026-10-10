import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { TravelShell } from "../../components/Shells";
import { CITIES } from "../../data/content";
import { useOwnedBooking, useStore } from "../../state/store";

export default function Stay() {
  const { bookingId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const { saveTravel } = useStore();
  const navigate = useNavigate();
  const [city, setCity] = useState(owned.booking?.travel?.mode === "stay" ? owned.booking.travel.city || "" : "");
  const [error, setError] = useState("");

  if (owned.status === "auth") return <Navigate to="/account" replace state={{ from: `/travel/${bookingId}/stay` }} />;
  if (owned.status === "missing") return <Navigate to="/" replace />;

  function submit(event) {
    event.preventDefault();
    const match = CITIES.find((name) => name.toLowerCase() === city.trim().toLowerCase());
    if (!match) {
      setError(`Use a city we keep hotels for: ${CITIES.join(", ")}.`);
      return;
    }
    saveTravel(owned.booking.id, { mode: "stay", city: match });
    navigate(`/travel/${owned.booking.id}/hotels`);
  }

  return (
    <TravelShell>
      <div className="tb-wrap tb-page">
        <p className="hours-label">Stay</p>
        <h1 className="quiet">Where do you want the room?</h1>
        <p className="tb-lede">Fill in the city. The next page lists hotels by name and price.</p>
        <form className="tb-form" onSubmit={submit}>
          <label className="field">
            City
            <input
              list="stay-cities"
              value={city}
              placeholder={owned.booking.to}
              onChange={(event) => setCity(event.target.value)}
            />
            <datalist id="stay-cities">
              {CITIES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          {error ? <p className="tb-error">{error}</p> : null}
          <div className="tb-actions">
            <button className="tb-btn" type="submit">
              Show hotels
            </button>
            <Link className="tb-btn-ghost" to={`/travel/${bookingId}`}>
              Back
            </Link>
          </div>
        </form>
      </div>
    </TravelShell>
  );
}
