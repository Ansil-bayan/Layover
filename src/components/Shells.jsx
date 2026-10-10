import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../state/store";

export function BusShell({ children }) {
  const { user } = useStore();
  useEffect(() => {
    document.title = "Layover";
  }, []);
  return (
    <div className="theme-bus">
      <header className="bus-top">
        <Link to="/" className="wordmark">
          Lay<span>over</span>
        </Link>
        <nav className="bus-nav">
          <Link to="/mingle">MingleBuddy</Link>
          <Link to="/travel">TravelBuddy</Link>
          <Link to="/trips">Trips</Link>
          <Link to="/account">{user ? user.name.split(" ")[0] : "Account"}</Link>
        </nav>
      </header>
      <div className="bus-wrap">{children}</div>
    </div>
  );
}

export function MingleShell({ children }) {
  useEffect(() => {
    document.title = "MingleBuddy";
  }, []);
  return (
    <div className="theme-mingle">
      <header className="mb-top">
        <Link to="/mingle" className="mb-brand">
          Mingle<i>Buddy</i>
        </Link>
        <nav className="mb-nav">
          <Link to="/mingle">Trips</Link>
          <Link to="/mingle/profile">Profile</Link>
          <Link to="/travel">TravelBuddy</Link>
          <Link to="/">Layover</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

export function TravelShell({ children }) {
  const { bookingId } = useParams();
  useEffect(() => {
    document.title = "TravelBuddy";
  }, []);
  return (
    <div className="theme-travel">
      <header className="tb-top">
        <Link to="/travel" className="tb-brand">
          TravelBuddy
        </Link>
        <nav className="tb-nav">
          <Link to="/mingle">MingleBuddy</Link>
          {bookingId ? <Link to={`/travel/${bookingId}/itinerary`}>Itinerary</Link> : null}
          {bookingId ? <Link to={`/ticket/${bookingId}`}>Ticket</Link> : null}
          <Link to="/">Layover</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
