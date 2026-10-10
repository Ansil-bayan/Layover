import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ProfileFields } from "../components/ProfileFields";
import { BusShell } from "../components/Shells";
import { emptyProfile, validateProfile } from "../lib/format";
import { useStore } from "../state/store";

export default function Account() {
  const { user, signup, login, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from || "/";
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wantProfile, setWantProfile] = useState(false);
  const [profile, setProfile] = useState(emptyProfile());
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  if (user) {
    return (
      <BusShell>
        <p className="kicker">Account</p>
        <h1>{user.name}</h1>
        <p className="lede">{user.email}</p>
        <div className="panel stack" style={{ marginTop: 16 }}>
          {user.profile ? (
            <p>
              MingleBuddy profile is set for {user.profile.name}, from {user.profile.place}. You can ride without
              using it.
            </p>
          ) : (
            <p>No MingleBuddy profile yet. Creating one is optional, and you can add it later.</p>
          )}
          <div className="action-row">
            <Link className="btn" to="/mingle/profile">
              {user.profile ? "Edit MingleBuddy profile" : "Create MingleBuddy profile"}
            </Link>
            <button className="btn ghost" type="button" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </BusShell>
    );
  }

  function submit(event) {
    event.preventDefault();
    setFormError("");
    if (!email.trim() || password.length < 4) {
      setFormError("Use an email and a password of at least 4 characters.");
      return;
    }
    if (mode === "login") {
      const result = login({ email, password });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      navigate(dest);
      return;
    }
    if (!name.trim()) {
      setFormError("Add your name.");
      return;
    }
    if (wantProfile) {
      const profileErrors = validateProfile(profile);
      setErrors(profileErrors);
      if (Object.keys(profileErrors).length) return;
    }
    const result = signup({
      name,
      email,
      password,
      profile: wantProfile ? profile : null,
    });
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate(dest);
  }

  return (
    <BusShell>
      <p className="kicker">Account</p>
      <h1>{mode === "signup" ? "Create your Layover account" : "Welcome back"}</h1>
      <p className="lede">
        Accounts stay on this browser so the demo can remember tickets and chats. Passwords are not sent anywhere.
      </p>
      <form className="account-card stack" style={{ padding: 18, marginTop: 18 }} onSubmit={submit}>
        {mode === "signup" ? (
          <label className="field">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        ) : null}
        <label className="field">
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="field">
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {mode === "signup" ? (
          <label className="checkline">
            <input
              type="checkbox"
              checked={wantProfile}
              onChange={(event) => {
                const checked = event.target.checked;
                setWantProfile(checked);
                if (checked) setProfile((current) => ({ ...current, name: current.name || name }));
              }}
            />
            <span>Also create a MingleBuddy profile. You can skip this and still book buses.</span>
          </label>
        ) : null}
        {mode === "signup" && wantProfile ? (
          <ProfileFields value={profile} onChange={setProfile} errors={errors} />
        ) : null}
        {formError ? <p className="form-error">{formError}</p> : null}
        <div className="action-row">
          <button className="btn" type="submit">
            {mode === "signup" ? "Create account" : "Log in"}
          </button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setFormError("");
            }}
          >
            {mode === "signup" ? "I already have an account" : "Create an account"}
          </button>
        </div>
      </form>
    </BusShell>
  );
}
