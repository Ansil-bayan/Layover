import { jsPDF } from "jspdf";

export function downloadItinerary(booking, plan) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  let y = 54;
  const margin = 48;

  const write = (text, size = 11, gap = 16) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, width - margin * 2);
    lines.forEach((line) => {
      if (y > 780) {
        doc.addPage();
        y = 54;
      }
      doc.text(line, margin, y);
      y += gap;
    });
  };

  doc.setFont("times", "bold");
  write("TravelBuddy itinerary", 22, 26);
  doc.setFont("times", "normal");
  write(`${plan.city} · ticket ${booking.id}`);
  const edits = booking.itineraryEdits || {};
  const guided =
    (edits.extraShopIds || []).length ||
    (edits.removedIds || []).length ||
    edits.depart ||
    edits.end;
  if (guided) write("This file is the itinerary after the guide's latest change.");
  if (plan.booked) {
    write(`Room ${plan.hotel.name}, ${plan.hotel.area}. Confirmation ${booking.hotel.confirmation}. ${booking.hotel.price} rupees a night.`);
  } else {
    write(`Route drafted from ${plan.hotel.name}. Book the room in TravelBuddy to hold it.`);
  }
  write(`Leave ${plan.hotel.name} at ${plan.leaveHotelAt}. Finish the walk by ${plan.endBy}.`);
  y += 8;

  plan.stops.forEach((stop, index) => {
    doc.setFont("times", "bold");
    write(`${index + 1}. ${stop.name}`, 13, 18);
    doc.setFont("times", "normal");
    write(`Leave ${stop.fromName} at ${stop.leaveAt}.`);
    write(`${stop.km} km, about ${stop.ride} minutes. Arrive ${stop.arriveAt}.`);
    write(`Spend ${stop.dwell} minutes. Leave this stop at ${stop.departAt}.`);
    if (stop.blurb || stop.note) write(stop.blurb || stop.note);
    y += 6;
  });

  if (plan.overflow.length) {
    doc.setFont("times", "bold");
    write("Beyond today's window", 13, 18);
    doc.setFont("times", "normal");
    plan.overflow.forEach((stop) => {
      write(`${stop.name}: ${stop.km} km from ${stop.fromName}. It does not fit before ${plan.endBy}.`);
    });
  }

  if (plan.offRoute.length) {
    doc.setFont("times", "bold");
    write("Gift shops not on this route", 13, 18);
    doc.setFont("times", "normal");
    plan.offRoute.forEach((shop) => write(`${shop.name}, ${shop.area}. ${shop.note}`));
  }

  y += 10;
  write("Times and distances come from the TravelBuddy OKF bundle. The map stays on the site and is not part of this file.");
  doc.save(`travelbuddy-${booking.id}.pdf`);
}
