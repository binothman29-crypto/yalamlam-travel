import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const navigate = useNavigate();
  
  const { lang, t, changeLanguage } = useLanguage();
  // FIX 1: Added 'rates' to the destructured variables
  const { currency, changeCurrency, rates } = useCurrency();

  useEffect(() => {
    const checkAuthAndStaff = async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('role')
          .eq('email', currentUser.email.toLowerCase())
          .maybeSingle();
        
        setIsStaff(!!staffData);
      } else {
        setIsStaff(false);
      }
    };

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      checkAuthAndStaff(session?.user || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAuthAndStaff(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsStaff(false);
    navigate('/');
    setIsMenuOpen(false);
  };

  // FIX 2: Added flag emojis back to the languages array
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  ];

  const currentLang = languages.find(l => l.code === lang);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <img src="/logo.png" alt="Yalamlam Travel" className="h-12 w-12" />
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-safari-green">Yalamlam</h1>
              <p className="text-xs text-safari-gold -mt-1">Travel & Tours</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link to="/" className="text-gray-700 hover:text-safari-green font-medium transition whitespace-nowrap">{t('home')}</Link>
            <Link to="/tours" className="text-gray-700 hover:text-safari-green font-medium transition whitespace-nowrap">{t('tours')}</Link>
            <Link to="/halal" className="text-gray-700 hover:text-safari-green font-medium transition whitespace-nowrap">{t('halalTourism')}</Link>
            <Link to="/destinations" className="text-gray-700 hover:text-safari-green font-medium transition whitespace-nowrap">{t('destinations')}</Link>
            <Link to="/contact" className="text-gray-700 hover:text-safari-green font-medium transition whitespace-nowrap">{t('contact')}</Link>
            
            {/* Language Switcher */}
            <div className="relative flex-shrink-0">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition border border-gray-200 whitespace-nowrap"
              >
                <span className="text-xl">{currentLang?.flag}</span>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{currentLang?.name}</span>
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
            
            {/* Currency Switcher */}
            <div className="relative flex-shrink-0 border-l border-gray-200 pl-3 ml-1">
              <select 
                value={currency} 
                onChange={(e) => changeCurrency(e.target.value)}
                className="appearance-none bg-transparent text-sm font-medium text-gray-700 hover:text-safari-green focus:outline-none cursor-pointer pr-6"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
              >
                {/* FIX 3: 'rates' is now properly defined, so this won't crash */}
                {rates && Object.keys(rates).map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="flex items-center space-x-3 flex-shrink-0">
                {isStaff && (
                  <Link to="/admin" className="text-safari-gold font-bold hover:text-yellow-600 transition hidden md:inline flex items-center gap-1">
                    ⚙️ Admin
                  </Link>
                )}
                
                <Link to="/dashboard" className="text-safari-green font-bold hover:text-safari-teal transition hidden md:inline">{t('myDashboard')}</Link>
                <button onClick={handleLogout} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition">{t('logout')}</button>
              </div>
            ) : (
              <Link to="/login" className="bg-safari-green text-white px-6 py-2 rounded-full font-bold hover:bg-safari-teal transition shadow-md flex-shrink-0">{t('login')}</Link>
            )}

            <Link to="/booking" className="bg-safari-gold text-white px-6 py-2 rounded-full font-bold hover:bg-yellow-600 transition shadow-md flex-shrink-0">{t('bookNow')}</Link>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition flex-shrink-0">
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
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">{t('home')}</Link>
              <Link to="/tours" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">{t('tours')}</Link>
              <Link to="/halal" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">{t('halalTourism')}</Link>
              <Link to="/destinations" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">{t('destinations')}</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-safari-green font-medium transition px-2">{t('contact')}</Link>

              {/* Mobile Language Switcher */}
              <div className="px-2 pt-2 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 mb-2">{t('selectLanguage')}</p>
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
                  {isStaff && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-safari-gold font-bold transition px-2 flex items-center gap-2">
                      ⚙️ Admin Dashboard
                    </Link>
                  )}
                  
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-safari-green font-bold transition px-2">{t('myDashboard')}</Link>
                  <button onClick={handleLogout} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition mx-2">{t('logout')}</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-safari-green text-white px-6 py-3 rounded-full font-bold hover:bg-safari-teal transition shadow-md text-center mx-2">{t('login')}</Link>
              )}

              <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="bg-safari-gold text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition shadow-md text-center mx-2">{t('bookNow')}</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}