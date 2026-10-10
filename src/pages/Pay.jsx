import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { BusShell } from "../components/Shells";
import { formatLong, inr } from "../lib/format";
import { useOwnedBooking } from "../state/store";

export default function Pay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const owned = useOwnedBooking(id);
  const [method, setMethod] = useState("upi");
  const [notice, setNotice] = useState("");

  if (owned.status === "auth") return <Navigate to="/account" replace state={{ from: `/booking/${id}/pay` }} />;
  if (owned.status === "missing") {
    return (
      <BusShell>
        <div className="empty">
          <h1>That booking is not on this browser.</h1>
          <Link to="/">Search buses</Link>
        </div>
      </BusShell>
    );
  }

  const booking = owned.booking;

  return (
    <BusShell>
      <p className="kicker">Payment</p>
      <h1>Layover Pay</h1>
      <p className="lede">
        {booking.from} to {booking.to} · {formatLong(booking.date)} · {booking.id}
      </p>
      <section className="panel pay-panel stack">
        <div className="fare">
          <span>Amount due</span>
          <strong>{inr(booking.price)}</strong>
        </div>
        <div className="pay-methods">
          {[
            ["upi", "UPI"],
            ["card", "Card"],
            ["bank", "Net banking"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={method === value ? "pay-method on" : "pay-method"}
              onClick={() => setMethod(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {method === "upi" ? (
          <label className="field">
            UPI id
            <input placeholder="name@bank" />
          </label>
        ) : null}
        {method === "card" ? (
          <>
            <label className="field">
              Card number
              <input placeholder="ACCT-000015" inputMode="numeric" />
            </label>
            <div className="pay-row">
              <label className="field">
                Expiry
                <input placeholder="MM/YY" />
              </label>
              <label className="field">
                CVV
                <input placeholder="123" inputMode="numeric" />
              </label>
            </div>
          </>
        ) : null}
        {method === "bank" ? (
          <label className="field">
            Bank
            <input placeholder="Choose a bank" />
          </label>
        ) : null}
        <p className="fine">This gateway template does not take a payment. The charge is not sent anywhere.</p>
        {notice ? <p className="form-error">{notice}</p> : null}
        <div className="action-row">
          <button className="btn ghost" type="button" onClick={() => setNotice("The payment gateway did not complete this charge.")}>
            Pay {inr(booking.price)}
          </button>
          <button className="btn" type="button" onClick={() => navigate(`/booking/${booking.id}/confirmed`)}>
            Next
          </button>
        </div>
      </section>
    </BusShell>
  );
}
