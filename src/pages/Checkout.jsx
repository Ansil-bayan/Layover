import { useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BusShell } from "../components/Shells";
import { busById } from "../data/content";
import { formatLong, inr, todayInputValue } from "../lib/format";
import { useStore } from "../state/store";

export default function Checkout() {
  const { busId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, createBooking } = useStore();
  const bus = busById(busId);
  const date = params.get("date") || "";
  const [passengerName, setPassengerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    return <Navigate to="/account" replace state={{ from: `/checkout/${busId}?date=${date}` }} />;
  }
  if (!bus || !date || date < todayInputValue(0)) {
    return (
      <BusShell>
        <div className="empty">
          <h1>This departure is not available.</h1>
          <Link to="/">Search again</Link>
        </div>
      </BusShell>
    );
  }

  function confirm(event) {
    event.preventDefault();
    if (!passengerName.trim()) {
      setError("Add the passenger name for the ticket.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Add a 10-digit phone number for the ticket.");
      return;
    }
    const booking = createBooking({
      bus,
      date,
      passengerName,
      phone,
      mingleInterest: false,
    });
    navigate(`/booking/${booking.id}/pay`);
  }

  return (
    <BusShell>
      <p className="kicker">Checkout</p>
      <h1>
        {bus.from} to {bus.to}
      </h1>
      <p className="lede">
        {bus.operator} · {formatLong(date)} · {bus.dep} to {bus.arr}. After your phone number, the next screen is the
        payment gateway. The seat is still assigned at 6:00 on the travel morning.
      </p>
      <form className="checkout" onSubmit={confirm}>
        <section className="panel stack">
          <h2>Passenger</h2>
          <label className="field">
            Name on ticket
            <input value={passengerName} onChange={(event) => setPassengerName(event.target.value)} />
          </label>
          <label className="field">
            Phone
            <input
              inputMode="numeric"
              value={phone}
              placeholder="10 digits"
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <div className="fare">
            <span>Fare</span>
            <strong>{inr(bus.price)}</strong>
          </div>
          <p className="fine">
            The seat number is released at 6:00 on {formatLong(date)}. MingleBuddy and TravelBuddy are offered after
            the ticket is confirmed.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn" type="submit">
            Confirm ticket
          </button>
        </section>
      </form>
    </BusShell>
  );
}
