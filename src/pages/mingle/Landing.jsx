import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MingleShell } from "../../components/Shells";
import { formatLong } from "../../lib/format";
import { useStore } from "../../state/store";

export default function Landing() {
  const navigate = useNavigate();
  const { user, bookings, setMingleInterest } = useStore();
  const [params] = useSearchParams();
  const mine = bookings.filter((item) => item.userId === user?.id);
  const requested = params.get("booking");
  const buddyId = mine.some((item) => item.id === requested) ? requested : mine[0]?.id;

  function openTrip(item) {
    if (!user.profile) {
      navigate(`/mingle/profile?next=${encodeURIComponent(`/mingle/journey/${item.id}`)}`);
      return;
    }
    setMingleInterest(item.id, true);
    navigate(`/mingle/journey/${item.id}`);
  }

  return (
    <MingleShell>
      {buddyId ? (
        <div className="mb-wrap mb-back-row">
          <Link className="mb-btn" to={`/booking/${buddyId}/companions`}>
            Back
          </Link>
        </div>
      ) : null}
      <section className="mb-hero">
        <div className="mb-wrap">
          <p className="mb-kicker">A walk-in for the bus</p>
          <h1>
            Find someone worth the <span className="mark">hours</span> between cities.
          </h1>
          <p className="deck">
            MingleBuddy is a room for people on the same departure who asked to be found. You make a profile once.
            Then you talk, privately, with whoever else opted in.
          </p>
          <div className="mb-hero-actions">
            <a className="mb-btn" href="#booked-trips">
              Your booked trips
            </a>
            <Link className="mb-btn-ghost" to={user ? "/mingle/profile" : "/account"}>
              {user?.profile ? "Your profile" : "Create a MingleBuddy profile"}
            </Link>
          </div>
        </div>
      </section>
      <section className="mb-wrap mb-page" id="booked-trips">
        <p className="mb-kicker">Booked trips</p>
        <h2 className="page-title">Pick a bus. Then add MingleBuddies.</h2>
        <p style={{ color: "var(--muted)", maxWidth: "40rem" }}>
          The room opens only for a trip you have booked. If your MingleBuddy profile is not ready yet, you will
          make it before anyone from that bus is added.
        </p>
        {!user ? (
          <p>
            <Link className="mb-btn" to="/account">
              Sign in to see your trips
            </Link>
          </p>
        ) : mine.length === 0 ? (
          <p>
            No tickets on this browser yet. <Link to="/">Book a bus on Layover</Link>.
          </p>
        ) : (
          <div className="room-list">
            {mine.map((item) => (
              <button key={item.id} type="button" className="person-row" onClick={() => openTrip(item)}>
                <div className="idx">{item.date.slice(8)}</div>
                <div>
                  <h2>
                    {item.from} to {item.to}
                  </h2>
                  <p>
                    {formatLong(item.date)} · {item.operator} · {item.id}
                  </p>
                  <p>{user.profile ? "Add MingleBuddies from this departure." : "Profile needed before you can add people."}</p>
                </div>
                <div className="tag">{item.mingleInterest ? "In the room" : "Select"}</div>
              </button>
            ))}
          </div>
        )}
      </section>
      <section className="mb-band">
        <div className="mb-wrap">
          <h2>Private doors. One neighbor seat.</h2>
          <p>
            You message one person at a time. Each conversation stays between the two of you. If you both want the
            same pair of seats, the morning allotment puts you side by side.
          </p>
        </div>
      </section>
      <section className="mb-wrap mb-zones">
        <article className="mb-zone">
          <em>01</em>
          <div>
            <h3>The profile</h3>
            <p>
              Name, place, age, gender, profession, interests, and a topic you can start from. It is optional when
              you create a Layover account. The departure room opens once it exists and you opt in for that bus.
            </p>
          </div>
        </article>
        <article className="mb-zone">
          <em>02</em>
          <div>
            <h3>The room</h3>
            <p>
              Everyone who asked to find a MingleBuddy on your departure is listed here. Open a person. There is no
              shared thread. The room is a set of doors.
            </p>
          </div>
        </article>
        <article className="mb-zone">
          <em>03</em>
          <div>
            <h3>The neighbor seat</h3>
            <p>
              Each chat has a request to sit next to each other. The morning allotment keeps you side by side. After
              that seat is fixed you can still change it or undo it.
            </p>
          </div>
        </article>
      </section>
    </MingleShell>
  );
}
