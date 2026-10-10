import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { TravelShell } from "../../components/Shells";
import { hotelsInCity } from "../../data/content";
import { inr } from "../../lib/format";
import { getCatalog } from "../../lib/okf";
import { useOwnedBooking, useStore } from "../../state/store";

export default function Hotels() {
  const { bookingId } = useParams();
  const owned = useOwnedBooking(bookingId);
  const { bookHotel } = useStore();
  const navigate = useNavigate();
  const catalog = getCatalog();
  if (owned.status === "auth") return <Navigate to="/account" replace state={{ from: `/travel/${bookingId}/hotels` }} />;
  if (owned.status === "missing") return <Navigate to="/" replace />;

  const city = owned.booking.travel?.city;
  if (!city || owned.booking.travel?.mode === "both") {
    return <Navigate to={owned.booking.travel?.mode === "both" ? `/travel/${bookingId}/plan` : `/travel/${bookingId}/stay`} replace />;
  }
  const hotels = hotelsInCity(city);

  return (
    <TravelShell>
      <div className="tb-wrap tb-page">
        <p className="hours-label">Stay · {city}</p>
        <h1 className="quiet">Hotels</h1>
        <p className="tb-lede">Name and nightly price. Sightseeing stays out of this list until you also choose See.</p>
        <div className="hotel-list">
          {hotels.map((hotel) => (
            <article key={hotel.id} className="hotel">
              <div className="hotel-top">
                <h2>{hotel.name}</h2>
                <div className="price">{inr(hotel.price)}</div>
              </div>
              <p className="area">{hotel.area}</p>
              <button
                className="tb-btn"
                type="button"
                onClick={() => {
                  const place = catalog.hotels.find((item) => item.id === hotel.id);
                  bookHotel(owned.booking.id, { ...hotel, city, lat: place?.lat, lng: place?.lng });
                  navigate(`/travel/${owned.booking.id}/itinerary`);
                }}
              >
                Book this room
              </button>
            </article>
          ))}
        </div>
        <div className="tb-actions">
          <Link className="tb-btn-ghost" to={`/travel/${bookingId}/stay`}>
            Change city
          </Link>
          <Link className="tb-btn olive" to={`/ticket/${bookingId}`}>
            Back to ticket
          </Link>
        </div>
      </div>
    </TravelShell>
  );
}
