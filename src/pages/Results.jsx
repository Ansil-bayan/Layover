import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BusShell } from "../components/Shells";
import { busesBetween } from "../data/content";
import { formatLong, inr } from "../lib/format";
import { useStore } from "../state/store";

export default function Results() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const date = params.get("date") || "";
  const buses = busesBetween(from, to);

  function book(busId) {
    const dest = `/checkout/${busId}?date=${date}`;
    if (!user) {
      navigate("/account", { state: { from: dest } });
      return;
    }
    navigate(dest);
  }

  return (
    <BusShell>
      <div className="results-head">
        <div>
          <p className="kicker">Departures</p>
          <h1>
            {from} to {to}
          </h1>
          <p className="meta">{date ? formatLong(date) : "Pick a date"} · Seat number arrives at 6:00 that morning</p>
        </div>
        <Link to="/" className="btn ghost">
          Change search
        </Link>
      </div>
      {buses.length === 0 ? (
        <div className="empty">
          <p>No coaches run that pair of cities in this timetable. Try Bengaluru to Kochi, or Mysuru.</p>
        </div>
      ) : (
        <div className="trip-list">
          {buses.map((bus) => (
            <article key={bus.id} className="trip-card">
              <div>
                <div className="operator">{bus.operator}</div>
                <div className="meta">
                  {bus.type} · Board at {bus.board}
                </div>
                <div className="seat-note">Ticket confirms now. Seat confirms at 6:00 on travel morning.</div>
              </div>
              <div className="timeline">
                <b>{bus.dep}</b>
                <i />
                <b>{bus.arr}</b>
              </div>
              <div className="price">
                <strong>{inr(bus.price)}</strong>
                <div className="meta">{bus.duration}</div>
                <button className="btn" type="button" onClick={() => book(bus.id)} style={{ marginTop: 10 }}>
                  Book ticket
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </BusShell>
  );
}
