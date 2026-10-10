export const PREFERENCES = [
  ["spiritual", "Spiritual"],
  ["hidden", "Hidden spots"],
  ["sightseeing", "Sightseeing"],
  ["popular", "Popular"],
  ["historic", "Historic landmarks"],
  ["everything", "Everything"],
];

export function preferenceLabel(id) {
  return PREFERENCES.find((item) => item[0] === id)?.[1] || "Everything";
}

export function PreferenceField({ value, onChange }) {
  return (
    <fieldset className="pref-field">
      <legend>What kind of places</legend>
      <div className="pref-row">
        {PREFERENCES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={value === id ? "tb-btn" : "tb-btn-ghost"}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function TravelBuddyChat({ log, pending, draft, setDraft, onAsk, onClear, prompts, placeholder }) {
  return (
    <section className="buddy-chat">
      <p className="hours-label">TravelBuddy</p>
      <h2>TravelBuddy</h2>
      <p className="tb-lede">
        TravelBuddy reads the city notes, then answers here. Ask about the day, a souvenir detour, or an amenity such as a
        currency exchange or a local restaurant.
      </p>
      <form
        className="buddy-ask"
        onSubmit={(event) => {
          event.preventDefault();
          onAsk(draft);
        }}
      >
        <label className="sr-only" htmlFor="travelbuddy-ask">
          Ask TravelBuddy
        </label>
        <input
          id="travelbuddy-ask"
          className="buddy-address"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder || "Ask TravelBuddy"}
        />
        <button className="tb-btn olive" type="submit" disabled={pending}>
          {pending ? "Asking…" : "Ask"}
        </button>
        <button
          className="tb-btn clear-chat"
          type="button"
          onClick={() => {
            setDraft("");
            onClear();
          }}
        >
          Clear chat
        </button>
      </form>
      <div className="prompt-row">
        {prompts.map((prompt) => (
          <button key={prompt} className="tb-btn-ghost" type="button" disabled={pending} onClick={() => onAsk(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
      <div className="guide-log">
        {(log || []).map((turn) => (
          <article key={turn.id} className={`guide-turn ${turn.role}`}>
            {turn.text}
          </article>
        ))}
        {pending ? <article className="guide-turn">Reading the city notes…</article> : null}
      </div>
    </section>
  );
}
