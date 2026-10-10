import { INTERESTS } from "../data/content";

const GENDERS = ["Woman", "Man", "Non-binary", "Prefer not to say"];

export function ProfileFields({ value, onChange, errors = {}, tone = "bus" }) {
  const chipClass = tone === "mingle" ? "mb-chip" : "chip";
  const errorClass = tone === "mingle" ? "mb-error" : "field-error";

  function toggle(interest) {
    const has = value.interests.includes(interest);
    onChange({
      ...value,
      interests: has ? value.interests.filter((item) => item !== interest) : [...value.interests, interest],
    });
  }

  return (
    <>
      <label className="field">
        Name
        <input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
        {errors.name ? <span className={errorClass}>{errors.name}</span> : null}
      </label>
      <label className="field">
        Place
        <input
          value={value.place}
          placeholder="City you are from"
          onChange={(event) => onChange({ ...value, place: event.target.value })}
        />
        {errors.place ? <span className={errorClass}>{errors.place}</span> : null}
      </label>
      <label className="field">
        Age
        <input
          type="number"
          min="18"
          max="99"
          value={value.age}
          onChange={(event) => onChange({ ...value, age: event.target.value })}
        />
        {errors.age ? <span className={errorClass}>{errors.age}</span> : null}
      </label>
      <label className="field">
        Gender
        <select value={value.gender} onChange={(event) => onChange({ ...value, gender: event.target.value })}>
          <option value="">Choose</option>
          {GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
        {errors.gender ? <span className={errorClass}>{errors.gender}</span> : null}
      </label>
      <label className="field">
        Profession
        <input
          value={value.profession}
          onChange={(event) => onChange({ ...value, profession: event.target.value })}
        />
        {errors.profession ? <span className={errorClass}>{errors.profession}</span> : null}
      </label>
      <div className="field">
        <span>Interests</span>
        <div className={tone === "mingle" ? "mb-chips" : "chips"}>
          {INTERESTS.map((interest) => (
            <button
              key={interest}
              type="button"
              className={`${chipClass}${value.interests.includes(interest) ? " on" : ""}`}
              aria-pressed={value.interests.includes(interest)}
              onClick={() => toggle(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
        {errors.interests ? <span className={errorClass}>{errors.interests}</span> : null}
      </div>
      <label className="field">
        Conversation starter topic
        <textarea
          rows="3"
          value={value.starter}
          placeholder="Something you can talk about for a few hours"
          onChange={(event) => onChange({ ...value, starter: event.target.value })}
        />
        {errors.starter ? <span className={errorClass}>{errors.starter}</span> : null}
      </label>
    </>
  );
}
