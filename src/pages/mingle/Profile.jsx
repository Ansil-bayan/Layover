import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ProfileFields } from "../../components/ProfileFields";
import { MingleShell } from "../../components/Shells";
import { emptyProfile, validateProfile } from "../../lib/format";
import { useStore } from "../../state/store";

export default function Profile() {
  const { user, saveProfile } = useStore();
  const [params] = useSearchParams();
  const next = params.get("next") || "/mingle";
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user?.profile ? { ...user.profile, age: String(user.profile.age) } : emptyProfile(user?.name || ""));
  const [errors, setErrors] = useState({});

  if (!user) return <Navigate to="/account" replace state={{ from: `/mingle/profile${next ? `?next=${encodeURIComponent(next)}` : ""}` }} />;

  function save(event) {
    event.preventDefault();
    const nextErrors = validateProfile(profile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    saveProfile(profile);
    navigate(next);
  }

  return (
    <MingleShell>
      <div className="mb-wrap mb-page">
        <p className="mb-kicker">Membership</p>
        <h1 className="page-title">Your MingleBuddy profile</h1>
        <p className="deck" style={{ color: "var(--muted)", maxWidth: "40rem" }}>
          This is the card other opted-in passengers see. It is separate from your Layover ticket name, and you can
          leave it blank until you want the room.
        </p>
        <form className="mb-form" style={{ marginTop: 22 }} onSubmit={save}>
          <ProfileFields tone="mingle" value={profile} onChange={setProfile} errors={errors} />
          <div className="mb-hero-actions">
            <button className="mb-btn" type="submit">
              Save profile
            </button>
            <Link className="mb-btn-ghost" to="/mingle">
              Back to the space
            </Link>
          </div>
        </form>
      </div>
    </MingleShell>
  );
}
