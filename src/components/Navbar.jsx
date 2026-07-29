import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Yalamlam Travel" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold text-safari-green">Yalamlam</h1>
              <p className="text-xs text-safari-gold -mt-1">Travel & Tours</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-safari-green font-medium transition">Home</Link>
            <Link to="/tours" className="text-gray-700 hover:text-safari-green font-medium transition">Tours</Link>
            <Link to="/halal-tourism" className="text-gray-700 hover:text-safari-green font-medium transition">Halal Tourism</Link>
            <Link to="/destinations" className="text-gray-700 hover:text-safari-green font-medium transition">Destinations</Link>
            <Link to="/contact" className="text-gray-700 hover:text-safari-green font-medium transition">Contact</Link>
            <Link to="/booking" className="bg-safari-green text-white px-6 py-2 rounded-full font-bold hover:bg-safari-teal transition shadow-md">
              Book Now
            </Link>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-safari-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">Home</Link>
              <Link to="/tours" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">Tours</Link>
              <Link to="/halal-tourism" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">Halal Tourism</Link>
              <Link to="/destinations" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">Destinations</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">Contact</Link>
              <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="bg-safari-green text-white px-6 py-3 rounded-full font-bold hover:bg-safari-teal transition shadow-md text-center mx-2">
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}