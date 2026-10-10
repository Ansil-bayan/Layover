import { Route, Routes } from "react-router-dom";
import Account from "./pages/Account";
import Checkout from "./pages/Checkout";
import Companions from "./pages/Companions";
import Confirmed from "./pages/Confirmed";
import Pay from "./pages/Pay";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Ticket from "./pages/Ticket";
import Trips from "./pages/Trips";
import Chat from "./pages/mingle/Chat";
import Landing from "./pages/mingle/Landing";
import Profile from "./pages/mingle/Profile";
import Room from "./pages/mingle/Room";
import Amenities from "./pages/travel/Amenities";
import Choose from "./pages/travel/Choose";
import Hotels from "./pages/travel/Hotels";
import Hub from "./pages/travel/Hub";
import Place from "./pages/travel/Place";
import Itinerary from "./pages/travel/Itinerary";
import Plan from "./pages/travel/Plan";
import See from "./pages/travel/See";
import Stay from "./pages/travel/Stay";
import { BusShell } from "./components/Shells";
import { Link } from "react-router-dom";

function Missing() {
  return (
    <BusShell>
      <div className="empty">
        <h1>That page is not on the timetable.</h1>
        <Link to="/">Back to search</Link>
      </div>
    </BusShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/checkout/:busId" element={<Checkout />} />
      <Route path="/booking/:id/pay" element={<Pay />} />
      <Route path="/booking/:id/confirmed" element={<Confirmed />} />
      <Route path="/booking/:id/companions" element={<Companions />} />
      <Route path="/ticket/:id" element={<Ticket />} />
      <Route path="/trips" element={<Trips />} />
      <Route path="/account" element={<Account />} />
      <Route path="/mingle" element={<Landing />} />
      <Route path="/mingle/profile" element={<Profile />} />
      <Route path="/mingle/journey/:bookingId" element={<Room />} />
      <Route path="/mingle/journey/:bookingId/chat/:personId" element={<Chat />} />
      <Route path="/travel" element={<Hub />} />
      <Route path="/travel/:bookingId" element={<Choose />} />
      <Route path="/travel/:bookingId/itinerary" element={<Itinerary />} />
      <Route path="/travel/:bookingId/stay" element={<Stay />} />
      <Route path="/travel/:bookingId/hotels" element={<Hotels />} />
      <Route path="/travel/:bookingId/plan" element={<Plan />} />
      <Route path="/travel/:bookingId/see" element={<See />} />
      <Route path="/travel/:bookingId/place" element={<Place />} />
      <Route path="/travel/:bookingId/amenities" element={<Amenities />} />
      <Route path="*" element={<Missing />} />
    </Routes>
  );
}
