import {Routes, Route, useLocation} from 'react-router-dom';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tours from './pages/Tours';
import Booking from './pages/Booking';
import HalalTourism from './pages/HalalTourism';
import Destinations from './pages/Destinations';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Admin from './pages/Admin';
import TourDetails from './pages/TourDetails';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Legal from './pages/Legal';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Blog from './pages/Blog';

// Initialize GA4
ReactGA.initialize('G-K4K4NMCD4M');

function App() {
  const location = useLocation();
  
  useEffect(() => {
    // Send a pageview to Google Analytics whenever the route changes
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
  }, [location]);

  return (
    // flex flex-col and min-h-screen ensures the footer stays at the bottom!
    <div className="min-h-screen bg-safari-sand text-safari-green font-body flex flex-col">
      <Navbar />
      {/* This is where the pages will render */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/halal" element={<HalalTourism />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/tours/:id" element={<TourDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/legal/:type" element={<Legal />} />
        </Routes>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

export default App;