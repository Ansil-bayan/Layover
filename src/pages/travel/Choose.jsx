import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { TravelShell } from "../../components/Shells";
import { useOwnedBooking } from "../../state/store";

export default function Choose() {
  const { bookingId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const navigate = useNavigate();
  const mode = owned.booking?.travel?.mode;
  const [stay, setStay] = useState(mode === "stay" || mode === "both");
  const [see, setSee] = useState(mode === "see" || mode === "both");

  if (owned.status === "auth") return <Navigate to="/account" replace state={{ from: `/travel/${bookingId}` }} />;
  if (owned.status === "missing") {
    return (
      <TravelShell>
        <div className="tb-wrap tb-page">
          <h1 className="quiet">This trip is not on this browser.</h1>
          <Link to="/">Back to Layover</Link>
        </div>
      </TravelShell>
    );
  }

  function go() {
    if (stay && see) navigate(`/travel/${bookingId}/plan`);
    else if (stay) navigate(`/travel/${bookingId}/stay`);
    else if (see) navigate(`/travel/${bookingId}/see`);
  }

  return (
    <TravelShell>
      <div className="choose-grid">
        <button type="button" className="choose-card stay" aria-pressed={stay} onClick={() => setStay((value) => !value)}>
          <div>
            <h1>Stay?</h1>
            <p>A hotel in the city you name. You see the name and the nightly price.</p>
          </div>
          <div className="state">{stay ? "Selected" : "Tap to choose"}</div>
        </button>
        <button type="button" className="choose-card see" aria-pressed={see} onClick={() => setSee((value) => !value)}>
          <div>
            <h1>See?</h1>
            <p>Places you can reach from where you are staying, sized to the time you can spend.</p>
          </div>
          <div className="state">{see ? "Selected" : "Tap to choose"}</div>
        </button>
      </div>
      <div className="choose-actions">
        <Link className="tb-btn" to={`/travel?booking=${bookingId}`}>
          Back
        </Link>
        <button className="tb-btn olive" type="button" disabled={!stay && !see} onClick={go}>
          {stay && see ? "Book a hotel" : "Continue"}
        </button>
        <Link className="tb-btn-ghost" to={`/travel/${bookingId}/place`}>
          I'll tell the place
        </Link>
        <Link className="tb-btn-ghost" to={`/ticket/${bookingId}`}>
          Skip to the ticket
        </Link>
      </div>
      <div className="tb-wrap">
        <div className="amenity-intro">
          <Link className="tb-btn olive" to={`/travel/${bookingId}/amenities`}>
            Go to TravelBuddy for amenities
          </Link>
          <p>
            TravelBuddy for amenities looks up practical stops around a location you name, such as a currency exchange
            near you or a local restaurant. You can add those stops to the TravelBuddy itinerary so the day covers the
            destinations and the amenities, or keep a new itinerary that covers only the amenities.
          </p>
        </div>
      </div>
    </TravelShell>
  );
}
