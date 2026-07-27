const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

export default function Footer() {
  return (
    <footer className="bg-safari-green text-white py-12 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
        <div className="flex items-center gap-3 mb-4">
          { /* This also uses the logo.png file */ }
          <img src="/logo.png" alt="Yalamlam Travel & Tours Logo" className="h-16 w-16 rounded-full" />
          <div>
            <span className="text-2xl font-heading font-bold block text-white">Yalamlam</span>
            <span className="text-sm text-safari-gold font-medium">Travel & Tours</span>
            <span className="text-xs text-safari-gold italic block mt-1">Where Faith Meets Travel Excellence</span>
          </div>
        </div>
          <p className="text-gray-300">Connecting the world to Africa's wildlife through the lens of Islamic values.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-safari-gold">Quick Links</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:text-white">Zanzibar Tours</a></li>
            <li><a href="#" className="hover:text-white">Tanzania Safaris</a></li>
            <li><a href="#" className="hover:text-white">Halal Packages</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-safari-gold">Contact Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li>Email: info@yalamlamtravel.com</li>
            <li>WhatsApp: +255 778 265 758</li>
            <li>WhatsApp: +255 773 348 401</li>
            <li>WhatsApp: +255 715 869 725</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-safari-teal text-center text-gray-400">
        <p>&copy; 2026 Yalamlam Travel & Tours. All rights reserved.</p>
      </div>
    </footer>
  );
}