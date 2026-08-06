import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const navigate = useNavigate();
  const { lang, changeLanguage, isRTL } = useLanguage();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
    setIsMenuOpen(false);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇷' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
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
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-safari-green font-medium transition">Home</Link>
            <Link to="/tours" className="text-gray-700 hover:text-safari-green font-medium transition">Tours</Link>
            <Link to="/halal" className="text-gray-700 hover:text-safari-green font-medium transition">Halal Tourism</Link>
            <Link to="/destinations" className="text-gray-700 hover:text-safari-green font-medium transition">Destinations</Link>
            <Link to="/contact" className="text-gray-700 hover:text-safari-green font-medium transition">Contact</Link>
            
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-xl">{languages.find(l => l.code === lang)?.flag}</span>
                <span className="text-sm font-medium">{languages.find(l => l.code === lang)?.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        changeLanguage(language.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 ${lang === language.code ? 'bg-safari-green/10 text-safari-green font-bold' : 'text-gray-700'}`}
                    >
                      <span className="text-xl">{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard" className="text-safari-green font-bold hover:text-safari-teal transition">My Dashboard</Link>
                <button onClick={handleLogout} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="bg-safari-green text-white px-6 py-2 rounded-full font-bold hover:bg-safari-teal transition shadow-md">Login</Link>
            )}
            
            <Link to="/booking" className="bg-safari-gold text-white px-6 py-2 rounded-full font-bold hover:bg-yellow-600 transition shadow-md">Book Now</Link>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
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
              <Link to="/halal" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">Halal Tourism</Link>
              <Link to="/destinations" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">Destinations</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">Contact</Link>
              
              {/* Mobile Language Switcher */}
              <div className="px-2 pt-2 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 mb-2">LANGUAGE / اللغة</p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        changeLanguage(language.code);
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${lang === language.code ? 'bg-safari-green text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-safari-green font-bold transition px-2">My Dashboard</Link>
                  <button onClick={handleLogout} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition mx-2">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-safari-green text-white px-6 py-3 rounded-full font-bold hover:bg-safari-teal transition shadow-md text-center mx-2">Login</Link>
              )}
              
              <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="bg-safari-gold text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition shadow-md text-center mx-2">Book Now</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}