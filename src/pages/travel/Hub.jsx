import { Link, Navigate, useSearchParams } from "react-router-dom";
import { TravelShell } from "../../components/Shells";
import { formatLong } from "../../lib/format";
import { useStore } from "../../state/store";

export default function Hub() {
  const { user, bookings } = useStore();
  const [params] = useSearchParams();
  if (!user) return <Navigate to="/account" replace state={{ from: "/travel" }} />;
  const mine = bookings.filter((booking) => booking.userId === user.id);
  const requested = params.get("booking");
  const buddyId = mine.some((booking) => booking.id === requested) ? requested : mine[0]?.id;

  return (
    <TravelShell>
      <div className="tb-wrap tb-page">
        {buddyId ? (
          <p className="tb-back-row">
            <Link className="tb-btn" to={`/booking/${buddyId}/companions`}>
              Back
            </Link>
          </p>
        ) : null}
        <p className="hours-label">TravelBuddy</p>
        <h1 className="quiet">Which trip is this for?</h1>
        <p className="tb-lede">
          Pick a bus you have already booked. From there you can choose a room, a walk, or both, then open the
          itinerary.
        </p>
        {buddyId ? (
          <div className="tb-actions">
            <Link className="tb-btn" to={`/travel/${buddyId}/place`}>
              I'll tell the place
            </Link>
          </div>
        ) : null}
        {buddyId ? (
          <div className="amenity-intro">
            <Link className="tb-btn olive" to={`/travel/${buddyId}/amenities`}>
              Go to TravelBuddy for amenities
            </Link>
            <p>
              TravelBuddy for amenities looks up practical stops around a location you name, such as a currency exchange
              near you or a local restaurant. You can add those stops to the TravelBuddy itinerary so the day covers the
              destinations and the amenities, or keep a new itinerary that covers only the amenities.
            </p>
          </div>
        ) : null}
        {mine.length === 0 ? (
          <p>
            No tickets yet. <Link to="/">Book a bus on Layover</Link>.
          </p>
        ) : (
          <div className="hotel-list">
            {mine.map((booking) => (
              <Link key={booking.id} to={`/travel/${booking.id}`} className="hotel" style={{ textDecoration: "none" }}>
                <div className="hotel-top">
                  <h2>
                    {booking.from} to {booking.to}
                  </h2>
                  <div className="price">{booking.hotel ? "Room booked" : "Open"}</div>
                </div>
                <p className="area">
                  {formatLong(booking.date)} · {booking.id}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </TravelShell>
  );
}
