import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { peopleForBus } from "../data/content";
import { allotmentMoment, assignSeats, normalizeProfile, uid } from "../lib/format";
import { getCatalog } from "../lib/okf";
import { persistAmenityCatalog, persistClearGuide, persistGuideMessage, persistMingleMessage, persistProfile, persistTicket } from "../lib/persist";

const KEY = "layover-state-v1";

const empty = {
  sessionUserId: null,
  users: [],
  bookings: [],
  messages: [],
  sitRequests: [],
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

const StoreContext = createContext(null);

function partnerRecord(requests, booking, userId) {
  const moment = allotmentMoment(booking);
  const accepted = requests
    .filter((request) => {
      if (request.bookingId !== booking.id || request.status !== "accepted") return false;
      if (request.fromId !== userId && request.toId !== userId) return false;
      return request.at <= moment;
    })
    .sort((a, b) => a.at - b.at);
  return accepted[0] || null;
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const commit = (updater) => {
    flushSync(() => setState(updater));
  };

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const current = state.users.find((entry) => entry.id === state.sessionUserId);
    if (!current) return;
    persistProfile(current);
    state.bookings
      .filter((booking) => booking.userId === current.id)
      .forEach((booking) => {
        persistTicket(booking);
        (booking.guideLog || []).forEach((turn) => persistGuideMessage(booking.id, current.id, turn));
      });
    state.messages
      .filter((message) => state.bookings.some((booking) => booking.id === message.bookingId && booking.userId === current.id))
      .forEach(persistMingleMessage);
  }, [state.sessionUserId]);

  useEffect(() => {
    persistAmenityCatalog(getCatalog().amenities);
  }, []);

  const user = state.users.find((entry) => entry.id === state.sessionUserId) || null;

  const api = useMemo(() => {
    function setNeighbor(bookingId, personId) {
      const author = user;
      if (!author) return { ok: false, error: "Sign in first." };
      const booking = state.bookings.find((item) => item.id === bookingId);
      if (!booking) return { ok: false, error: "Booking missing." };
      const people = peopleForBus(booking.busId);
      const person = personId ? people.find((entry) => entry.id === personId) : null;
      if (personId && !person) return { ok: false, error: "That traveller is not on this bus." };
      let seat = null;
      let savedBooking = null;
      commit((prev) => ({
        ...prev,
        bookings: prev.bookings.map((item) => {
          if (item.id !== bookingId) return item;
          const partner = person ? { id: person.id, name: person.name } : null;
          const released = Date.now() >= allotmentMoment(item) || item.seatLocked;
          seat = released ? assignSeats(item.id, partner) : null;
          savedBooking = {
            ...item,
            neighborChoice: {
              personId: person?.id || null,
              name: person?.name || null,
              at: Date.now(),
            },
            seatLocked: released ? seat : item.seatLocked,
          };
          return savedBooking;
        }),
        sitRequests: person
          ? [
              ...prev.sitRequests.filter(
                (request) =>
                  !(
                    request.bookingId === bookingId &&
                    ((request.fromId === author.id && request.toId === person.id) ||
                      (request.fromId === person.id && request.toId === author.id))
                  )
              ),
              {
                id: uid("S"),
                bookingId,
                fromId: author.id,
                toId: person.id,
                status: "accepted",
                at: Date.now(),
                name: person.name,
              },
            ]
          : prev.sitRequests,
      }));
      persistTicket(savedBooking);
      return { ok: true, seat, name: person?.name || null };
    }

    return {
      setNeighbor,
      signup({ name, email, password, profile }) {
        const cleanEmail = email.trim().toLowerCase();
        if (state.users.some((entry) => entry.email === cleanEmail)) {
          return { ok: false, error: "An account with that email is already on this browser." };
        }
        const next = {
          id: uid("U"),
          name: name.trim(),
          email: cleanEmail,
          password,
          profile: profile ? normalizeProfile(profile) : null,
        };
        commit((prev) => ({
          ...prev,
          sessionUserId: next.id,
          users: [...prev.users, next],
        }));
        persistProfile(next);
        return { ok: true };
      },

      login({ email, password }) {
        const cleanEmail = email.trim().toLowerCase();
        const found = state.users.find((entry) => entry.email === cleanEmail);
        if (!found || found.password !== password) {
          return { ok: false, error: "That email and password do not match an account on this browser." };
        }
        commit((prev) => ({ ...prev, sessionUserId: found.id }));
        return { ok: true };
      },

      logout() {
        commit((prev) => ({ ...prev, sessionUserId: null }));
      },

      saveProfile(profile) {
        const nextProfile = normalizeProfile(profile);
        let saved = null;
        commit((prev) => ({
          ...prev,
          users: prev.users.map((entry) => {
            if (entry.id !== prev.sessionUserId) return entry;
            saved = { ...entry, profile: nextProfile };
            return saved;
          }),
        }));
        persistProfile(saved);
      },

      createBooking({ bus, date, passengerName, phone, mingleInterest }) {
        const booking = {
          id: uid("LY-"),
          userId: state.sessionUserId,
          busId: bus.id,
          from: bus.from,
          to: bus.to,
          date,
          dep: bus.dep,
          arr: bus.arr,
          duration: bus.duration,
          operator: bus.operator,
          type: bus.type,
          board: bus.board,
          price: bus.price,
          passengerName: passengerName.trim(),
          phone: phone.trim(),
          mingleInterest: Boolean(mingleInterest),
          travel: null,
          seatLocked: null,
          neighborChoice: null,
          hotel: null,
          itineraryEdits: { extraShopIds: [], removedIds: [], depart: null, end: null },
          guideLog: [],
          createdAt: Date.now(),
        };
        commit((prev) => ({ ...prev, bookings: [booking, ...prev.bookings] }));
        persistTicket(booking);
        return booking;
      },

      setMingleInterest(bookingId, mingleInterest) {
        let saved = null;
        commit((prev) => ({
          ...prev,
          bookings: prev.bookings.map((booking) => {
            if (booking.id !== bookingId) return booking;
            saved = { ...booking, mingleInterest };
            return saved;
          }),
        }));
        persistTicket(saved);
      },

      saveTravel(bookingId, travel) {
        let saved = null;
        commit((prev) => ({
          ...prev,
          bookings: prev.bookings.map((booking) => {
            if (booking.id !== bookingId) return booking;
            saved = { ...booking, travel: { ...booking.travel, ...travel }, itineraryPlan: null };
            return saved;
          }),
        }));
        persistTicket(saved);
      },

      sendMessage(bookingId, toId, text) {
        const author = user;
        if (!author) return;
        const booking = state.bookings.find((item) => item.id === bookingId);
        const people = booking ? peopleForBus(booking.busId) : [];
        const person = people.find((entry) => entry.id === toId);
        const outgoing = {
          id: uid("M"),
          bookingId,
          fromId: author.id,
          toId,
          text: text.trim(),
          at: Date.now(),
        };
        const reply = person
          ? {
              id: uid("M"),
              bookingId,
              fromId: toId,
              toId: author.id,
              text: person.reply,
              at: Date.now() + 1,
            }
          : null;
        commit((prev) => ({
          ...prev,
          messages: [...prev.messages, outgoing, ...(reply ? [reply] : [])],
        }));
        persistMingleMessage(outgoing);
        if (reply) persistMingleMessage(reply);
      },

      undoNeighbor(bookingId) {
        return setNeighbor(bookingId, null);
      },

      sendSitRequest(bookingId, toId) {
        return setNeighbor(bookingId, toId);
      },

      respondSitRequest(bookingId, fromId, accept) {
        if (!accept) {
          const author = user;
          if (!author) return { ok: false, error: "Sign in first." };
          commit((prev) => ({
            ...prev,
            sitRequests: [
              ...prev.sitRequests.filter(
                (request) =>
                  !(request.bookingId === bookingId && request.fromId === fromId && request.toId === author.id)
              ),
              {
                id: uid("S"),
                bookingId,
                fromId,
                toId: author.id,
                status: "declined",
                at: Date.now(),
                name: peopleForBus(state.bookings.find((item) => item.id === bookingId)?.busId || "").find(
                  (entry) => entry.id === fromId
                )?.name,
              },
            ],
          }));
          const booking = state.bookings.find((item) => item.id === bookingId);
          const current = booking ? plannedNeighbor(booking, author.id, state.sitRequests) : null;
          if (current?.id === fromId) return setNeighbor(bookingId, null);
          return { ok: true };
        }
        return setNeighbor(bookingId, fromId);
      },

      bookHotel(bookingId, hotel) {
        const confirmation = uid("HB-");
        let saved = null;
        commit((prev) => ({
          ...prev,
          bookings: prev.bookings.map((item) => {
            if (item.id !== bookingId) return item;
            saved = {
              ...item,
              itineraryPlan: null,
              hotel: {
                id: hotel.id,
                name: hotel.name,
                city: hotel.city,
                area: hotel.area,
                price: hotel.price,
                lat: hotel.lat,
                lng: hotel.lng,
                confirmation,
                bookedAt: Date.now(),
              },
            };
            return saved;
          }),
        }));
        persistTicket(saved);
        return confirmation;
      },

      saveAmenityPlan(bookingId, amenityPlan) {
        let saved = null;
        commit((prev) => ({
          ...prev,
          bookings: prev.bookings.map((item) => {
            if (item.id !== bookingId) return item;
            saved = { ...item, amenityPlan };
            return saved;
          }),
        }));
        persistTicket(saved);
      },

      saveItineraryEdits(bookingId, itineraryEdits, itineraryPlan = null) {
        let saved = null;
        commit((prev) => ({
          ...prev,
          bookings: prev.bookings.map((item) => {
            if (item.id !== bookingId) return item;
            saved = {
              ...item,
              itineraryEdits,
              itineraryPlan: itineraryPlan || item.itineraryPlan || null,
            };
            return saved;
          }),
        }));
        persistTicket(saved);
      },

      clearGuideLog(bookingId) {
        commit((prev) => ({
          ...prev,
          bookings: prev.bookings.map((item) => (item.id === bookingId ? { ...item, guideLog: [] } : item)),
        }));
        persistClearGuide(bookingId);
      },

      pushGuideTurn(bookingId, turn) {
        commit((prev) => ({
          ...prev,
          bookings: prev.bookings.map((item) =>
            item.id === bookingId ? { ...item, guideLog: [...(item.guideLog || []), turn] } : item
          ),
        }));
        if (user) persistGuideMessage(bookingId, user.id, turn);
      },

      syncSeat(bookingId) {
        commit((prev) => {
          const booking = prev.bookings.find((item) => item.id === bookingId);
          const owner = prev.users.find((entry) => entry.id === booking?.userId);
          if (!booking || !owner || booking.seatLocked) return prev;
          if (Date.now() < allotmentMoment(booking)) return prev;
          const neighbor = plannedNeighbor(booking, owner.id, prev.sitRequests);
          const seats = assignSeats(booking.id, neighbor);
          return {
            ...prev,
            bookings: prev.bookings.map((item) =>
              item.id === bookingId ? { ...item, seatLocked: seats } : item
            ),
          };
        });
      },
    };
    // state is read for validation responses; updates themselves use functional setState
  }, [state, user]);

  const value = { ...state, user, ...api, currentUser: user };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}

export function useOwnedBooking(id) {
  const { bookings, user } = useStore();
  if (!user) return { status: "auth" };
  const booking = bookings.find((item) => item.id === id && item.userId === user.id) || null;
  if (!booking) return { status: "missing", booking: null };
  return { status: "ok", booking };
}

export function plannedNeighbor(booking, userId, requests) {
  if (booking.neighborChoice) {
    if (!booking.neighborChoice.personId) return null;
    const chosen = peopleForBus(booking.busId).find((entry) => entry.id === booking.neighborChoice.personId);
    return {
      id: booking.neighborChoice.personId,
      name: chosen?.name || booking.neighborChoice.name || "Traveller",
    };
  }
  const moment = allotmentMoment(booking);
  const partner = requests
    .filter(
      (request) =>
        request.bookingId === booking.id &&
        request.status === "accepted" &&
        request.at <= moment &&
        (request.fromId === userId || request.toId === userId)
    )
    .sort((a, b) => a.at - b.at)[0];
  if (!partner) return null;
  const otherId = partner.fromId === userId ? partner.toId : partner.fromId;
  const person = peopleForBus(booking.busId).find((entry) => entry.id === otherId);
  return { id: otherId, name: person?.name || partner.name || "Traveller" };
}

export function sitStatus({ booking, userId, person, requests }) {
  const locked = Boolean(booking.seatLocked) || Date.now() >= allotmentMoment(booking);
  const related = requests.filter(
    (request) =>
      request.bookingId === booking.id &&
      ((request.fromId === userId && request.toId === person.id) ||
        (request.fromId === person.id && request.toId === userId))
  );
  const accepted = related.find((request) => request.status === "accepted");
  const declined = related.find((request) => request.status === "declined" && request.fromId === person.id);
  const partnerId = plannedNeighbor(booking, userId, requests)?.id || null;
  return {
    locked,
    accepted: Boolean(accepted),
    declined: Boolean(declined),
    pendingInvite: person.askedYou && !accepted && !declined && partnerId !== person.id,
    partnerId,
    isPartner: partnerId === person.id,
    blockedByOther: false,
  };
}
