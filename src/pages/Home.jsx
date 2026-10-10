import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BusShell } from "../components/Shells";
import { CITIES } from "../data/content";
import { todayInputValue } from "../lib/format";

export default function Home() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Bengaluru");
  const [to, setTo] = useState("Kochi");
  const [date, setDate] = useState(todayInputValue(1));
  const [error, setError] = useState("");

  function search(event) {
    event.preventDefault();
    if (from === to) {
      setError("Pick two different cities.");
      return;
    }
    if (!date) {
      setError("Pick a travel date.");
      return;
    }
    navigate(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
  }

  return (
    <BusShell>
      <section className="hero">
        <div>
          <p className="kicker">Bus tickets</p>
          <h1>Book the ride. The seat can wait.</h1>
          <p className="lede">
            Your ticket is confirmed when you finish checkout. The seat number is released at 6:00 on the morning
            of the day you travel.
          </p>
        </div>
        <div className="fact-stack">
          <div className="fact">
            <strong>Ticket now</strong>
            <span>Route, date, and passenger are locked in.</span>
          </div>
          <div className="fact">
            <strong>Seat at sunrise</strong>
            <span>Allotment runs at 6:00 on the travel morning.</span>
          </div>
          <div className="fact">
            <strong>Buddies after</strong>
            <span>Talk on the bus, or plan the city you arrive in.</span>
          </div>
        </div>
      </section>
      <form className="search-slab" onSubmit={search}>
        <label className="field">
          From
          <select value={from} onChange={(event) => setFrom(event.target.value)}>
            {CITIES.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>
        <label className="field">
          To
          <select value={to} onChange={(event) => setTo(event.target.value)}>
            {CITIES.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Date
          <input type="date" min={todayInputValue(0)} value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button className="btn" type="submit">
          Find buses
        </button>
        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </BusShell>
  );
}
