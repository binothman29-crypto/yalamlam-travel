import { Link } from 'react-router-dom';

const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
           <Link to="/" className="flex items-center gap-2">
            {/* This uses the logo.png file */}
               <img 
                 src="/logo.png" 
                 alt="Yalamlam Travel & Tours" 
                 className="h-14 w-14 rounded-full shadow-lg ring-2 ring-safari-gold ring-offset-2" 
              />
            <div className="flex flex-col">
              <span className="text-2xl font-heading font-bold text-safari-green leading-tight">Yalamlam</span>
              <span className="text-sm text-safari-teal font-medium">Travel & Tours</span>
              <span className="text-xs text-safari-gold italic">Where Faith Meets Travel Excellence</span>
            </div>
          </Link>
          <div className="hidden md:flex space-x-8 font-medium">
            <Link to="/" className="hover:text-safari-gold transition">Home</Link>
            <Link to="/tours" className="hover:text-safari-gold transition">Tours</Link>
            <Link to="/halal" className="hover:text-safari-gold transition">Halal Tourism</Link>
            <Link to="/destinations" className="hover:text-safari-gold transition">Destinations</Link>
            <Link to="/contact" className="hover:text-safari-gold transition">Contact</Link>
          </div>
          <Link to="/booking" className="bg-safari-green text-white px-6 py-2 rounded-full hover:bg-safari-teal transition font-semibold">
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
}